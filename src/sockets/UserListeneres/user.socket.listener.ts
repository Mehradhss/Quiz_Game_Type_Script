import generateRoomId from "../../services/GameServices/RoomCreation";
import createGame from "../../services/GameServices/game.creation.service";
import joinGame from "../../services/GameServices/game.join.service";
import {getGameQuestions} from "../../services/GameServices/GameQuestions";
import {io} from "../../server/serverConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {getRedisClient} from "../../RedisConfig/RedisConfig";
import {authSocketMiddleware} from "../../middleware/authMiddleware";
import {Socket} from "socket.io";
import socketWrapper from "../../middleware/wrappers/socketWrapper";
import {playerReadyToStart} from "../../services/GameServices/GameReadyToStart";
import {getVerifiedUserService} from "../../services/Auth/getVerifiedUser.service";
import getGame from "../../services/GameServices/game.search.service";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTING: 'STARTING',
    IN_GAME: 'IN-GAME',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

type VerifiedUser = {
    id: number
}

const v1UserRoute = io.of('/v1/user').use((socket, next) => {
    authSocketMiddleware(socket, next)
})

// const v1UserRoute = io.of('/v1/user')

export const userSocketListeners = asyncWrapper(async (server) => {
        v1UserRoute.adapter.on("create-room", (room) => {
            console.log(`[${new Date().toISOString()}]`, `room ${room} was created`);
        })

        v1UserRoute.on('connection', asyncWrapper(async (socket: Socket) => {
            const socketId = socket.id;
            console.log(`A user connected with ID: ${socketId}`);

            const verifiedUser = await getVerifiedUserService(socket?.handshake?.headers.authorization.split('|')[1])

            const redisClient = await getRedisClient()
            redisClient.set(socketId, verifiedUser?.userId?.toString(), 'EX', 2 * 60 * 60)

            socketWrapper(socket, 'createGame', async () => {
                try {
                    redisClient.exists(socketId, async (err, result) => {
                        if (err) {
                            throw new Error('session expired please try again' + err)
                        }

                        redisClient.expire(socketId, 2 * 60 * 60)
                    })

                    const roomId = generateRoomId()

                    const Game = await createGame(roomId, socketId, gameStatus.PENDING)

                    const gameId = Game.id

                    console.log('roomId is : ', roomId)
                    console.log('gameId is : ', gameId)

                    socket.join(roomId)

                    socket.emit('gameCreated', {roomId: roomId})
                    console.log(`Game Created With Room id ${roomId}`)
                } catch (error) {
                    socket.emit('gameCreationError', {error: {message: "Game Creation error: " + error.message}});
                    console.log(`Game Creation error is ${error}`)
                }
            })

            socketWrapper(socket, 'joinGame', async (data) => {
                redisClient.exists(socketId, async (err, result) => {
                    if (err) {
                        throw new Error('session expired please try again' + err)
                    }

                    redisClient.expire(socketId, 2 * 60 * 60)
                })

                const roomId = data.roomId

                const room = io.sockets.adapter.rooms.get(roomId)

                if (room && room.size < 2) {
                    redisClient.get(roomId, async (err, gameId) => {
                        if (err) {
                            throw new Error('Error fetching data from Redis:' + err)
                        } else if (!gameId) {
                            socket.emit('gameJoinError', {error: {message: "game not found"}});
                        }

                        socket.join(roomId)
                        socket.emit('gameJoin', {message: "game joined successfully with room id : " + roomId});

                        try {
                            await joinGame(gameId, socketId, gameStatus.STARTING)
                            socket.join(roomId)
                        } catch (e) {
                            socket.emit('gameJoinError', {error: {message: "unable to join game"}});
                            return
                        }

                        console.log('User joined game with room ID:', roomId);
                    })
                }
            })

            socketWrapper(socket, 'searchForGame', async (data) => {
                redisClient.exists(socketId, async (err, result) => {
                    if (err) {
                        throw new Error('session expired please try again' + err)
                    }

                    redisClient.expire(socketId, 2 * 60 * 60)
                })

                try {
                    const game = await getGame(socketId, gameStatus.PENDING)
                    console.log(game)
                    const roomId = await redisClient.get(game?.id.toString(), err => {
                        if (err) {
                            return
                        }
                    })

                    const pendingGame = {
                        id: game.id,
                        roomId: roomId
                    }

                    socket.emit('searchForGameSuccess', {data: pendingGame});
                } catch (e) {
                    socket.emit('searchForGameError', {error: {message: "unable to search for game", e}});
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
                        socket.on('fetchQuestion', async (data) => {
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

        }))
    }
)