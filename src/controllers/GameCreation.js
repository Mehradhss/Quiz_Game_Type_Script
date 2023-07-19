// const socketIO = require('socket.io')
const {getIo} = require('../controllers/Connection')
//
//

//
async function createGame(){
    let io = getIo()
    try{
        io.on ('connection', (socket) => {
        const clientId = socket.id;
        console.log(`A user connected with ID: ${clientId}`);
        socket.on('createGame', (data) => {
            const roomId = generateRoomId()
            socket.join(roomId)
            socket.emit('Game Created' , {roomId: roomId})
            console.log('Game Created With Room id : ${roomId}')
        })
    })
    }catch(error){
        console.log(error)
    }
}

module.exports = {
    createGame
}
