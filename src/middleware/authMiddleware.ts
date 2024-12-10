import {Server, Socket} from 'socket.io'
import {expressjwt} from 'express-jwt'
import {NextFunction, Request} from 'express'
import * as jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.TOKEN_SECRET ?? 'the_secret_key'

const authSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const middleware = expressjwt({
        secret: secretKey,
        algorithms: ['HS256'],
        getToken: (req: Request) => {
            return socket?.handshake?.headers?.authorization!.split('|')[0] ?? ''
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