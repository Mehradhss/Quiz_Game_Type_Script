import {getRedisClient} from "../../RedisConfig/RedisConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";

export const renew = asyncWrapper(async (key, type) => {
    const redisClient = await getRedisClient()

    let expirationTime: number

    switch (type) {
        case "room" :
            expirationTime = 30 * 60;
            break;
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