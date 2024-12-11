import express from "express";
import {httpServer} from "./server/serverConfig";
import {createRedisClient} from "./RedisConfig/RedisConfig";
import {config} from "dotenv";

config();
// const {createSocketConnection: createSocketConnection} = require('./sockets/UserListeneres/UserSocketListener')

const appPort = process.env.APP_PORT ?? 3000
httpServer.listen(appPort, async () => {
    try {
        // try {
        //     await createRedisClient().then(async () => {
        //         await singularRabbitConnection.connectQueue().then(async () => {
        //             console.log(`[${Date.now()}]`, 'rabbit connected')
        //             await userSocketListeners(io)
        //         })
        //     })

    } catch (err) {
        console.error("app error", err)

        throw new Error(err)
    }
    console.log(`http server created and listening on port ${appPort}`)
})