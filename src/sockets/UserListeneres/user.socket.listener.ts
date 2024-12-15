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
import {renew} from "../../services/Redis/redis.renew.expire.date.service";
import {getJoinAbleGameRoom, getEmptyGameRoom} from "../../services/Game/game.room.search.service";
import isUserJoined from "../../services/Game/room.is.user.joined.service";
import {Game} from "../../../database/entity/Game";
import {release} from "node:os";
import {start} from "node:repl";
import {startGame} from "../../services/Game/game.start.service";
import {User} from "../../../database/entity/User";
import {fetchQuestion} from "../../services/Game/game.fetch.question.service";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTED: 'STARTED',
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

                verifiedUser.gameRooms.forEach((gameRoom: GameRoom) => {
                    socket.join(gameRoom.uuid)
                })

                const verifiedUserId = verifiedUser?.id

                const redisClient = await getRedisClient()

                socketWrapper(socket, 'createGameRoom', async () => {
                    try {
                        const availableEmptyRoom = await getEmptyGameRoom()

                        if (availableEmptyRoom) {
                            await joinRoom(socket, availableEmptyRoom.uuid, verifiedUserId)

                            redisClient.set(`room.${availableEmptyRoom.uuid}`, availableEmptyRoom.uuid, "EX", 30 * 60)

                            socket.emit('gameRoomCreated', {roomId: availableEmptyRoom.uuid})

                            return
                        }

                        const newRoom = await createRoom(verifiedUserId)

                        redisClient.set(`room.${newRoom.uuid}`, newRoom.uuid, "EX", 30 * 60)

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

                    const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                        where: {
                            uuid: roomId
                        },
                        relations: ['users']
                    });

                    const isVerifiedUserJoined = await isUserJoined(gameRoom, verifiedUserId);
                    if (gameRoom && gameRoom.users.length < 2) {
                        try {
                            if (isVerifiedUserJoined) {
                                socket.emit('gameRoomJoinError', {error: {message: "user already joined"}});

                                return
                            }

                            await joinRoom(socket, roomId, verifiedUserId);

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

                        await renew(`room.${pendingGameRoom.uuid}`, 'room')

                        socket.emit('searchForGameSuccess', {data: pendingGameRoomData});
                    } catch (e) {
                        socket.emit('searchForGameError', {error: {message: "unable to search for game", e}});
                    }
                })

                socketWrapper(socket, 'selectCategory', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId;

                        if (!roomId || !verifiedUser.gameRooms.some((gameRoom) => gameRoom.uuid === roomId)) {
                            socket.emit("selectCategoryError", {error: {message: "room not found"}});

                            return
                        }

                        const categoryId = data.categoryId;

                        const categoryRepository = await dataSource.getRepository(Category);
                        const category = await categoryRepository.findOneOrFail({
                            where: {
                                id: categoryId
                            }
                        })

                        await renew(`room.${roomId}`, 'room')

                        v1UserRoute.to(roomId).emit("categorySelected", {
                            data: {
                                category: category
                            }
                        });
                    } catch (e) {
                        socket.emit('selectCategoryError', {error: {message: `unable to select category : ${e}`}});
                    }
                })

                socketWrapper(socket, 'createGame', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId;
                        if (!roomId) {
                            throw new Error('room id not provided');
                        }

                        const categoryId = data.categoryId;
                        if (!categoryId) {
                            throw new Error("category not provided")
                        }

                        const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                        const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                            where: {
                                uuid: roomId
                            },
                            relations: ["users", "users.games", "games"]
                        })

                        if (!socketRoom || !gameRoom) {
                            throw new Error('room not found');
                        }

                        if (socketRoom.size < 2 || gameRoom.users.length < 2) {
                            throw new Error("not enough players");
                        }

                        if (!await isUserJoined(gameRoom, verifiedUserId)) {
                            throw new Error("user not joined");
                        }

                        socket.join(gameRoom.uuid)

                        await renew(`room.${roomId}`, 'room')

                        const newGame = await createGame(gameRoom, gameStatus.PENDING, categoryId)

                        v1UserRoute.to(gameRoom.uuid).emit('gameCreated', {data: {game: newGame}})
                    } catch (e) {
                        socket.emit('gameCreationError', {error: {message: `unable to create game : ${e.message}`}});
                    }
                })

                socketWrapper(socket, 'readyToStart', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }

                        const gameId = data.gameId
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users"]
                        })

                        if (game.status === gameStatus.STARTED) {
                            throw new Error("game already started")
                        }

                        if (game.users.length < 2) {
                            throw new Error("not enough players to ready up !");
                        }

                        const playerReadyKey = `game.${gameId}.ready.players`;

                        const stringUserId = verifiedUserId.toString();

                        if (await redisClient.exists(playerReadyKey)) {
                            if (await redisClient.hexists(playerReadyKey, stringUserId)) {
                                throw new Error('player already readied up !')
                            }
                        }

                        await redisClient.hset(playerReadyKey, stringUserId, stringUserId)

                        const readiedUpUser = await dataSource.getRepository(User).findOneOrFail({
                            where: {
                                id: verifiedUserId
                            }
                        })

                        await renew(playerReadyKey, "game")

                        await renew(`room.${roomId}`, 'room')

                        v1UserRoute.to(roomId).emit('roomPlayerReady', {data: {user: readiedUpUser}})
                        socket.emit("playerReady", {data: {user: readiedUpUser}})
                    } catch (err) {
                        socket.emit('readyToStartError', {error: {message: `ready up failed to : ${err.message}`}})
                    }
                })

                socketWrapper(socket, 'startGame', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        if (socketRoom.size < 2) {
                            throw new Error("a player disconnected!")
                        }

                        const playerReadyKey = `game.${gameId}.ready.players`;
                        if (!await redisClient.exists(playerReadyKey) || await redisClient.hlen(playerReadyKey) < 2) {
                            throw new Error("players must ready up")
                        }

                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users", "gameQuestions", "category"]
                        });
                        if (game.status === gameStatus.STARTED) {
                            throw new Error("game already started")
                        }
                        if (game.users.length < 2) {
                            throw new Error("not enough players to start game !");
                        }

                        await renew(playerReadyKey, "game")

                        await renew(`room.${roomId}`, 'room')

                        const started = await startGame(game, gameStatus.STARTED)

                        v1UserRoute.to(roomId).emit("gameStarted", {data: {game: started}})
                    } catch (e) {
                        console.log(e)
                        socket.emit("gameStartError", {error: {message: `game failed to start : ${e.message}`}})
                    }
                })

                socketWrapper(socket, 'fetchQuestion', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew(`room.${roomId}`, 'room')

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users", "gameQuestions", "category"]
                        });

                        if (game.users.length < 2) {
                            throw new Error("not enough players to continue the game !")
                        }

                        if (game.status != gameStatus.STARTED) {
                            if (game.status === gameStatus.FINISHED) {
                                socket.emit("gameFinished", {data: {message: "this game is finished"}})

                                return
                            }

                            throw new Error("game has not started yet");
                        }

                        const fetchedGameQuestion = await fetchQuestion(game, verifiedUserId)

                        if (!fetchedGameQuestion) {
                            socket.emit("gameFinished", {
                                data: {
                                    message: "game finished",
                                    user: verifiedUser
                                }
                            })

                            v1UserRoute.to(roomId).emit("gameFinished", {
                                data: {
                                    message: "game finished",
                                    user: verifiedUser
                                }
                            })

                            throw new Error("all questions fetched!")
                        }

                        socket.emit("questionFetched", {data: {question: fetchedGameQuestion}})
                    } catch (e) {
                        console.log(e)
                        socket.emit("fetchQuestionError", {error: {message: `fetch question failed : ${e.message}`}})
                    }
                })

                socketWrapper(socket, "submitAnswer", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew()

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                    }catch (e) {

                    }
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