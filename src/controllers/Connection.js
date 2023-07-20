const {server} = require('../server')
const socketIO = require('socket.io')
const {generateRoomId: generateRoomId} = require('../controllers/RoomCreation')
const {verify} = require('../controllers/TokenVerification')
const {createGame} = require('../controllers/GameCreation')
const {findGame} = require('../controllers/FindGame')
const redis = require('../redis-config')
const {dataSource} = require('../../dbconfig/data-source')
const  {startGame} = require('./GameStart')


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
    io.on('connection',(socket) => {
        const accessToken = socket.handshake.headers.authorization.split('Bearer ')[1]
        const user = verify (accessToken)
        socket.id = user.id
        const clientId = socket.id;
        console.log(`A user connected with ID: ${clientId}`);
        socket.on('createGame', async (data) => {
            const roomId = generateRoomId()
            try {
                console.log(socket.id)
                socket.join(roomId)
                let Game = await createGame(socket.id, gameStatus.PENDING)//.then(console.log('repo connected !')).then(findGame(socket.id))
                const gameId = Game.id
                console.log('roomid is : ',roomId)
                console.log('gameid is : ',gameId)
                redis.set(roomId, gameId, (err, result) => {
                    if (err) {
                        console.error('Error saving data to Redis:', err);
                    } else {
                        console.log('Record added successfully!');
                    }
                })
                socket.emit('Game Created', {roomId: roomId})
                console.log(`Game Created With Room id ${roomId}`)
            }catch(error){
                console.log(`Game Creation error is ${error}`)
            }
        })
        socket.on('joinGame', (data) => {
            console.log(data.data[0].roomId)
            const roomId = data.data[0].roomId;
            console.log(roomId)
            // console.log(gameid)
            // foundGame = findGame(gameid)
            // console.log(`foundgame is : ${foundGame}`)
            const room = io.sockets.adapter.rooms.get(roomId)

            if (room){
                let joinedRoomGameId
                redis.get(roomId, (err, gameId) => {
                    if (err) {
                        console.log('Error fetching data from Redis:', err)
                    } else if (gameId) {
                        if (room && room.size < 2) {
                            socket.join(roomId)
                            socket.emit('gameJoined', {roomId: roomId});
                            startGame(gameId, socket.id , gameStatus.STARTING)
                            console.log('User joined game with room ID:', roomId);
                        } else {
                            console.log("room is not joinable!")
                            socket.emit('gameJoinError', {message: 'Uanble to join the game. Room is full or does not exist.'});
                        }
                        // console.log(`Game ID for Room ID ${roomId}: ${gameId}`)
                    } else {
                        console.log('Game ID not found for the given Room ID')
                    }
                })
              let idis =   Array.from(room);
              console.log(idis)
            }
            // if (room && room.size < 2) {
            //     socket.join(roomId);
            //     socket.emit('gameJoined', {roomId: roomId});
            //     console.log('User joined game with room ID:', roomId);
            // } else {
            //     console.log("room is not joinable!")
            //     socket.emit('gameJoinError', {message: 'Uanble to join the game. Room is full or does not exist.'});
            // }
        })
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