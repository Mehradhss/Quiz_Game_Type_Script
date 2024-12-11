import {Socket} from 'socket.io'
import {expressjwt} from 'express-jwt'
import {Request} from 'express'
import {config} from 'dotenv'

config()

const secretKey = process.env.ACCESS_TOKEN_SECRET ?? 'Access_Token_Secret'

const authSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const middleware = expressjwt({
        secret: secretKey,
        algorithms: ['HS256'],
        getToken: (req: Request) => {
            return socket?.handshake?.headers?.authorization!.split('|')[1] ?? ''
        },
    })
    middleware(socket.request as Request, {} as any, (err) => {
        if (err) {
            return next(new Error(`Authentication error: ${err.message}`))
        }

        next()
    })
}
export {
    authSocketMiddleware
}