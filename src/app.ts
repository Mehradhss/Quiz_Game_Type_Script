import {httpServer, io} from "./server/serverConfig";
import {createRedisClient} from "./RedisConfig/redis.config";
import {config} from "dotenv";
import {userSocketListeners} from "./sockets/UserListeneres/user.socket.listener";

config();

const appPort = process.env.APP_PORT ?? 3000

httpServer.listen(appPort, async () => {
    try {
        await createRedisClient().then(async () => {
            await userSocketListeners(io)
        })
    } catch (err) {
        console.error("app error", err)
        throw new Error(err)
    }

    console.log(`http server created and listening on port ${appPort}`)
})