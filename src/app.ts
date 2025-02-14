import {httpServer, io} from "./server/server.config";
import {createRedisClient} from "./redis/RedisConfig/redis.config";
import {config} from "dotenv";
import {userSocketListeners} from "./sockets/UserListeneres/user.socket.listener";
import {dataSource} from "../database/DataSource";
import * as i18n from "i18n";
import path from "node:path";

config();

const i18nConfigOptions = {
    locales: ['fa'],
    directory: path.join(__dirname, 'lang/locales'),
    defaultLocale: 'fa'
}
i18n.configure(i18nConfigOptions);

const appPort = process.env.APP_PORT ?? 3000
httpServer.listen(appPort, async () => {
    try {
        await createRedisClient().then(async () => {
            await dataSource.initialize().then(
                () => {
                    console.log("Connected")
                }
            ).catch((err: any) => {
                console.log("Connection error is : ", err)
                throw new Error(err)
            })

            await userSocketListeners(io)
        })
    } catch (err) {
        console.error("app error", err)
        throw new Error(err)
    }

    console.log(`http server created and listening on port ${appPort}`)
})