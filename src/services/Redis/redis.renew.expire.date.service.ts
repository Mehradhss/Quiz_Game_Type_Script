import {getRedisClient} from "../../RedisConfig/RedisConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";

export const renew = asyncWrapper(async (socketId) => {
    const redisClient = await getRedisClient()

    redisClient.exists(socketId, async (err) => {
        if (err) {
            throw new Error('session expired please try again' + err)
        }

        redisClient.expire(socketId, 2 * 60 * 60)
    })

})