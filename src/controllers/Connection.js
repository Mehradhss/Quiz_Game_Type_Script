const {server} = require('../server')
const socketIO = require('socket.io')
const {generateRoomId: generateRoomId} = require('../controllers/RoomCreation')
const {verify} = require('../controllers/TokenVerification')

const gameType = Object.freeze({
    PENDING: 'PENDING',
    GREEN: 'GREEN',
    BLUE: 'BLUE'
});

let io

function createSocketConnection(server, token) {
    io = socketIO(server)
    io.on('connection', (socket) => {
        const accessToken = socket.handshake.headers.authorization.split('Bearer ')[1]
        const user = verify (accessToken)
        socket.id = user.id
        const clientId = socket.id;
        console.log(`A user connected with ID: ${clientId}`);
        socket.on('createGame', (data) => {
            const roomId = generateRoomId()
            socket.join(roomId)
            socket.emit('Game Created', {roomId: roomId})
            console.log(`Game Created With Room id ${roomId}`)
        })
        socket.on('joinGame', (data) => {
            console.log(data.data[0].roomId)
            const roomId = data.data[0].roomId;
            console.log(roomId)
            const room = io.sockets.adapter.rooms.get(roomId);
            if (room){
              let idis =   Array.from(room);
              console.log(idis)
            }
            if (room && room.size < 2) {
                socket.join(roomId);
                socket.emit('gameJoined', {roomId: roomId});
                console.log('User joined game with room ID:', roomId);
            } else {
                console.log("room is not joinable!")
                socket.emit('gameJoinError', {message: 'Uanble to join the game. Room is full or does not exist.'});
            }
        });
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