import express from "express";
import authRoute from "./routes/authRoutes";
import {httpServer} from "./server/serverConfig";
import {createRedisClient} from "./RedisConfig/RedisConfig";

const {createSocketConnection: createSocketConnection} = require('./sockets/UserListeneres/UserSocketListener')

httpServer.listen(port, async () => {
    try {
        try {
            await createRedisClient().then(async () => {
                await singularRabbitConnection.connectQueue().then(async () => {
                    console.log(`[${Date.now()}]`, 'rabbit connected')
                    await userSocketListeners(io)
                })
            })
        } catch (err) {
            console.error("app error", err)
            throw new WsCritical876("app start error")
        }
        console.log(`http server created and listening on port ${port}`)
    } catch (e) {
        console.log(e)
    }
})