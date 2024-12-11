import generateRoomId from "../../services/GameServices/RoomCreation";
import createGame from "../../services/GameServices/GameCreation";
import {updateGame} from "../../services/GameServices/GameJoin";
import {getGameQuestions} from "../../services/GameServices/GameQuestions";
import {io} from "../../server/serverConfig";
const {getGameQuestion} = require('./FetchQuestion')
const {gameInit} = require('./GameFirstInit')
const {getGameQuestions} = require('./GameQuestions')
const {submitAnswer} = require("./SubmitAnswer")
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {getRedisClient} from "../../RedisConfig/RedisConfig";
import {authSocketMiddleware} from "../../middleware/authMiddleware";
import asyncHandler from "express-async-handler";
import {Socket} from "socket.io";
import socketWrapper from "../../middleware/wrappers/socketWrapper";
import {playerReadyToStart} from "../../services/GameServices/GameReadyToStart";
import {getVerifiedUserService} from "../../services/Auth/getVerifiedUser.service";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTING: 'STARTING',
    IN_GAME: 'IN-GAME',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

type VerifiedUser = {
    id : number
}


const v1UserRoute = io.of('/v1/user').use((socket, next) => {
    authSocketMiddleware(socket, next)
})

export const userSocketListeners = asyncWrapper(async (server) => {
        v1UserRoute.adapter.on("create-room", (room) => {
            console.log(`[${new Date().toISOString()}]`, `room ${room} was created`);
        })

        const redisClient = getRedisClient()
        v1UserRoute.on('connection', asyncHandler(async (socket: Socket) => {
            const clientId = socket.id
            console.log(`A user connected with ID: ${clientId}`);

            const redisClient = await getRedisClient()

            socketWrapper(socket, 'createGame', async () => {
                try {
                    const roomId = generateRoomId()
                    socket.join(roomId)

                    const Game = await createGame(socket.id, gameStatus.PENDING)

                    const gameId = Game.id

                    console.log('roomId is : ', roomId)
                    console.log('gameId is : ', gameId)

                    redisClient.set(roomId, gameId, 'EX', 86400, (err) => {
                        if (err) {
                            console.error('Error saving data to R   edis:', err);
                        } else {
                            console.log('Rec    ord added successfully!');
                        }
                    })

                    socket.emit('Game Created', {roomId: roomId})
                    console.log(`Game Created With Room id ${roomId}`)
                } catch (error) {
                    console.log(`Game Creation error is ${error}`)
                }
            })
            socketWrapper(socket, 'joinGame', async (data) => {
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

                        await updateGame(gameId, socket.id, gameStatus.STARTING).then('game')

                        console.log('User joined game with room ID:', roomId);
                    })
                }

                socket.emit('gameJoinError', {error: {message: 'Unable to join the game. Room is full or does not exist.'}});
            })

            socketWrapper(socket, 'readyToStart', async (data) => {
                try {
                    const roomId = data.roomId
                    console.log(roomId)

                    await redisClient.get(roomId, async (err, gameId) => {
                        if (err) {
                            socket.emit('readyToStartError' , {error: {message : 'room not found'}});
                        } else if (gameId) {
                            const accessToken = socket.handshake.headers.authorization.split('Bearer ')[1]
                            const verifiedUser : VerifiedUser = getVerifiedUserService(accessToken)

                            await playerReadyToStart(verifiedUser!.id , gameId)

                            socket.emit('gameStarted', {roomId: roomId});
                        }
                    })
                } catch (err) {
                    socket.emit('readyToStartError', {error: {message: 'game failed to start' + err}})
                }
            })
            socket.on('started', async (data) => {
                const roomId = data!.roomId ?? ''
                await redisClient.get(roomId, async (err, gameId) => {
                    if (err) {
                        console.log('Error fetching data from Redis:', err)
                    } else if (gameId) {
                        await gameInit(gameId, gameStatus.IN_GAME, socket.id)
                        socket.on('fetchQuestion', async (data) => {
                            try {


                            } catch (error) {
                                console.log(`fetch question error is ${error}`)
                            }
                        })
                    }
                })
            })


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