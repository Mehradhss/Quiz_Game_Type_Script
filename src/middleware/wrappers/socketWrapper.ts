import {Socket} from 'socket.io'

export default function socketWrapper(socket: Socket, eventName: string, handler: (...args: any[]) => Promise<void>, exceptionEventName?: string) {
    socket.on(eventName, async (...args: any[]) => {
        try {
            await handler(...args);
        } catch (error: any) {
            const exceptionName = exceptionEventName ?? "exception"

            const dataToEmit = {
                error: {
                    message: `an ${exceptionName} accord: ${error.message}}`
                }
            };

            socket.emit(exceptionName, dataToEmit)

            console.error('an error occurred in socket event handler:', error)
        }
    })
}
