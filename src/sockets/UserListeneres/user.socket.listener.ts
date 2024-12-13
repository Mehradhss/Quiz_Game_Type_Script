import generateRoomUuId from "../../services/Game/RoomCreation";
import createGame from "../../services/Game/game.creation.service";
import joinRoom from "../../services/Game/room.join.service";
import {getGameQuestions} from "../../services/Game/GameQuestions";
import {io} from "../../server/serverConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {getRedisClient, getRedisSubscriber} from "../../RedisConfig/RedisConfig";
import {authSocketMiddleware} from "../../middleware/authMiddleware";
import {Socket} from "socket.io";
import socketWrapper from "../../middleware/wrappers/socketWrapper";
import {playerReadyToStart} from "../../services/Game/GameReadyToStart";
import {getVerifiedUserService} from "../../services/Auth/getVerifiedUser.service";
import createRoom from "../../services/Game/room.creation.service";
import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";
import {GameRoom} from "../../../database/entity/GameRoom";
import {json} from "express";
import {roomExpired} from "../../services/Redis/redis.room.expired.service";
import {renew} from "../../services/Redis/redis.renew.expire.date.service";
import getJoinAbleGameRoom from "../../services/Game/game.room.search.service";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTING: 'STARTING',
    IN_GAME: 'IN-GAME',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

const v1UserRoute = io.of('/v1/user').use((socket, next) => {
    authSocketMiddleware(socket, next)
})

// const v1UserRoute = io.of('/v1/user')

export const userSocketListeners = asyncWrapper(async () => {
        v1UserRoute.adapter.on("create-room", (room) => {
            console.log(`[${new Date().toISOString()}]`, `room ${room} was created`);
        })

        v1UserRoute.on('connection', asyncWrapper(async (socket: Socket) => {
                const socketId = socket.id;
                console.log(`A user connected with ID: ${socketId}`);

                const verifiedUser = await getVerifiedUserService(socket?.handshake?.headers.authorization.split('|')[1])

                const verifiedUserId = verifiedUser?.userId

                const redisClient = await getRedisClient()

                socketWrapper(socket, 'createGameRoom', async () => {
                    try {
                        const newRoom = await createRoom(verifiedUserId)

                        redisClient.set(`room.${newRoom.uuid}`, newRoom.uuid, "EX", 5)

                        socket.join(newRoom.uuid)

                        socket.emit('gameRoomCreated', {roomId: newRoom.uuid})
                    } catch (e) {
                        socket.emit("createGameRoomError", {error: {message: `unable to create room ${e.message}`}})
                    }
                })

                socketWrapper(socket, 'joinGameRoom', async (data) => {
                    data = JSON.parse(data)

                    const roomId = data.roomId
                    if (!roomId) {
                        socket.emit('gameRoomJoinError', {error: {message: "room id not found"}});

                        return;
                    }

                    const room = v1UserRoute.adapter.rooms.get(roomId)

                    if (room && room.size < 2) {
                        try {
                            const gameRoom = await joinRoom(socket, roomId, verifiedUserId);

                            await renew(`room.${gameRoom.uuid}`, 'room')
                        } catch (e) {
                            socket.emit('gameRoomJoinError', {error: {message: `unable to join game : ${e.message}`}});

                            return
                        }

                        socket.emit('gameRoomJoined', {roomId: roomId});
                        console.log('User joined game with room ID:', roomId);

                        return
                    }

                    socket.emit('gameRoomJoinError', {error: {message: "room is full"}});
                    console.log('room is full')
                })

                socketWrapper(socket, 'searchForGameRoom', async () => {
                    try {
                        const pendingGameRoom = await getJoinAbleGameRoom(verifiedUserId)

                        const pendingGameRoomData = {
                            id: pendingGameRoom.id,
                            roomId: pendingGameRoom.uuid
                        }

                        socket.emit('searchForGameSuccess', {data: pendingGameRoomData});
                    } catch (e) {
                        socket.emit('searchForGameError', {error: {message: "unable to search for game", e}});
                    }
                })

                socketWrapper(socket, 'selectCategory', async (data) => {
                    try {
                        const categoryId = data.category_id;

                        const categoryRepository = await dataSource.getRepository(Category);
                        const category = await categoryRepository.findOneOrFail({
                            where: {
                                id: categoryId
                            }
                        })

                        socket.emit("categorySelected", {
                            data: {
                                category: category
                            }
                        });
                    } catch (e) {
                        socket.emit('selectCategoryError', {error: {message: "unable to select category", e}});
                    }
                })

                socketWrapper(socket, 'createGame', async (data) => {
                    try {
                        const roomId = data.roomId;

                        if (!roomId) {
                            throw new Error('room id not provided');
                        }

                        const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                        const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                            where: {
                                uuid: roomId
                            },
                            relations: ["users", "users.games"]
                        })

                        if (!socketRoom || !gameRoom) {
                            throw new Error('room not found');
                        }

                        if (socketRoom.size < 2 || gameRoom.users.length < 2) {
                            throw new Error("not enough players");
                        }

                        const newGame = await createGame(gameRoom, gameStatus.PENDING)

                        socket.emit('gameCreated', {data: {game: newGame}})
                    } catch (e) {
                        socket.emit('createGameError', {error: {message: `unable to create game : ${e.message}`}});
                    }
                })
                // socketWrapper(socket, 'readyToStart', async (data) => {
                //     try {
                //         const roomId = data.roomId
                //         console.log(roomId)
                //
                //         await redisClient.get(roomId, async (err, gameId) => {
                //             if (err) {
                //                 socket.emit('readyToStartError' , {error: {message : 'room not found'}});
                //             } else if (gameId) {
                //                 const accessToken = socket.handshake.headers.authorization.split('Bearer ')[1]
                //                 const verifiedUser : VerifiedUser = getVerifiedUserService(accessToken)
                //
                //                 await playerReadyToStart(verifiedUser!.id , gameId)
                //
                //                 socket.emit('gameStarted', {roomId: roomId});
                //             }
                //         })
                //     } catch (err) {
                //         socket.emit('readyToStartError', {error: {message: 'game failed to start' + err}})
                //     }
                // })

                socket.on('started', async (data) => {
                    const roomId = data!.roomId ?? ''
                    await redisClient.get(roomId, async (err, gameId) => {
                        if (err) {
                            console.log('Error fetching data from Redis:', err)
                        } else if (gameId) {
                            // await gameInit(gameId, gameStatus.IN_GAME, socket.id)
                            socket.on('fetchQuestion', async () => {
                                try {


                                } catch (error) {
                                    console.log(`fetch question error is ${error}`)
                                }
                            })
                        }
                    })
                })

                socketWrapper(socket, 'disconnect', async () => {
                    if (redisClient.exists(socketId)) {
                        redisClient.del(socketId)
                    }
                });


                // socket.on('fetchQuestion', async (data) => {
                //     try {
                //         // await redis.get(roomId, async (err, gameId) => {
                //         //     if (err) {
                //         //         console.log('Error fetching data from Redis:', err)
                //         //     } else if (gameId) {
                //         let temp
                //         // const gameQuestions = await getGameQuestions(1, 1)
                //
                //         temp = gameQuestions
                //         console.log(temp)
                //         fetchedQuestion = await getQuestion(1 , temp )
                //         await temp.pop(fetchedQuestion)
                //         console.log(fetchedQuestion)
                //         // }
                //         // })
                //     } catch (error) {
                //         console.log(`fetching question error is : ${error}`)
                //     }
                //
                // })
                // socket.on('test' , async (data) => {
                //     try{
                //         await submitAnswer(1 , data.game_question_id , data.answer_id ,socket.id)
                //
                //
                //
                //         }catch (error) {
                //         console.log(`test error is  : ${error}`)
                //     }
                // })

            })
        )
    }
)