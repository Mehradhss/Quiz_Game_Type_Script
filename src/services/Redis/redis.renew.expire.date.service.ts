import {getRedisClient} from "../../RedisConfig/redis.config";
import asyncWrapper from "../../middleware/wrappers/async.wrapper";

export const renew = asyncWrapper(async (key, type) => {
    const redisClient = await getRedisClient()

    let expirationTime: number

    switch (type) {
        case "room" :
            expirationTime = 30 * 60;
            break;
        case "game" :
            expirationTime = 3 * 60 * 60
            break
        default:
            expirationTime = 2 * 60 * 60;
            break;
    }

    redisClient.exists(key, async (err) => {
        if (err) {
            throw new Error('session expired please try again' + err)
        }

        redisClient.expire(key, expirationTime)
    })
})