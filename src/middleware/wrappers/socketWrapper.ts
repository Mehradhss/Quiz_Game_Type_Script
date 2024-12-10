import {Socket} from 'socket.io'

export default function socketWrapper(socket: Socket, eventName: string, handler: (...args: any[]) => Promise<void>) {
    socket.on(eventName, async (...args: any[]) => {
        try {
            await handler(...args);
        } catch (error: any) {
            socket.emit('exception', {
                'data' : {
                    message : "this is a simple error message from socket wrapper"
                }
            } )
            console.error('an error occurred in socket event handler:', error)
        }
    })
}
