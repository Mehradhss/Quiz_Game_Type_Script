const {server} = require('../server')
const socketIO = require('socket.io')
const {generateRoomId: generateRoomId} = require('../controllers/RoomCreation')
const {verify} = require('../controllers/TokenVerification')
const {createGame} = require('../controllers/GameCreation')
const {findGame} = require('../controllers/FindGame')
const redis = require('../redis-config')
const {dataSource} = require('../../dbconfig/data-source')
const {startGame} = require('./GameJoin')
const {getGameQuestion} = require('./FetchQuestion')
const {gameInit} = require('./GameFirstInit')
const {getGameQuestions} = require('./GameQuestions')
const typeORM = require("typeorm");
const {submitAnswer} = require("./SubmitAnswer")
const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTING: 'STARTING',
    IN_GAME: 'IN-GAME',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

let io

function createSocketConnection(server, token) {
    io = socketIO(server)
    io.on('connection', (socket) => {
        const accessToken = socket.handshake.headers.authorization.split('Bearer ')[1]
        const user = verify(accessToken)
        socket.id = user.id
        const clientId = socket.id
        console.log(`A user connected with ID: ${clientId}`);
        socket.on('createGame', async (data) => {
            const roomId = generateRoomId()
            try {
                console.log(socket.id)
                socket.join(roomId)
                let Game = await createGame(socket.id, gameStatus.PENDING)//.then(console.log('repo connected !')).then(findGame(socket.id))
                const game_id = Game.id
                console.log('roomid is : ', roomId)
                console.log('gameid is : ', game_id)
                redis.set(roomId, game_id, (err, result) => {
                    if (err) {
                        console.error('Error saving data to Redis:', err);
                    } else {
                        console.log('Record added successfully!');
                    }
                })
                socket.emit('Game Created', {roomId: roomId})
                console.log(`Game Created With Room id ${roomId}`)
            } catch (error) {
                console.log(`Game Creation error is ${error}`)
            }
        })
        socket.on('joinGame', (data) => {
            const roomId = socket.handshake.headers.roomId
            console.log(roomId)
            // console.log(gameid)
            // foundGame = findGame(gameid)
            // console.log(`foundgame is : ${foundGame}`)
            const room = io.sockets.adapter.rooms.get(roomId)

            if (room && room.size <= 2) {
                redis.get(roomId, (err, game_id) => {
                    if (err) {
                        console.log('Error fetching data from Redis:', err)
                    } else if (game_id) {
                        if (room && room.size < 2) {
                            socket.join(roomId)
                            socket.emit('gameJoined', {roomId: roomId});
                            startGame(game_id, socket.id, gameStatus.STARTING)
                            console.log('User joined game with room ID:', roomId);
                        } else {
                            console.log("room is not joinable!")
                            socket.emit('gameJoinError', {message: 'Unable to join the game. Room is full or does not exist.'});
                        }
                        // console.log(`Game ID for Room ID ${roomId}: ${game_id}`)
                    } else {
                        console.log('Game ID not found for the given Room ID')
                    }
                })
                let idis = Array.from(room);
                console.log(idis)
            } else if (room && room.size > 2) {
                socket.emit('gameJoinError', {message: 'Unable to join the game. Room is full .'});
                console.log('Room is full');
            } else {
                socket.emit('gameJoinError', {message: 'Unable to join The Game'})
                console.log("room is not joinable!")
            }
        })
        socket.on('readyToStart', async (data) => {
            const roomId = socket.handshake.headers.roomId
            try {
                await redis.get(roomId, async (err, game_id) => {
                    if (err) {
                        console.log('Error fetching data from Redis:', err)
                    } else if (game_id) {
                        socket.emit('gameStarted', {roomId: roomId});
                        const category_id = data.categoryId
                        const gameQuestions = await getGameQuestions(game_id, category_id).then(gameInit(game_id, gameStatus.IN_GAME, socket.id))
                        console.log(gameQuestions)
                        socket.on('fetchQuestion', async (data) => {
                            fetchedQuestion = await getGameQuestion(1)
                            console.log(fetchedQuestion)
                            socket.on('submitAnswer', async (data) => {
                                await submitAnswer(1, fetchedQuestion.id, data.answer_id, socket.id).then()
                            })
                        })
                    }
                })
            } catch (err) {
                console.log(`fetch question error is :${err}`)
            }
        })

        // socket.on('fetchQuestion', async (data) => {
        //     try {
        //         // await redis.get(roomId, async (err, game_id) => {
        //         //     if (err) {
        //         //         console.log('Error fetching data from Redis:', err)
        //         //     } else if (game_id) {
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
}

function getIo() {
    if (!io) {
        throw new Error('Socket.IO connection has not been created yet.')
    }
    return io
}

module.exports = {
    createSocketConnection,
    getIo
}