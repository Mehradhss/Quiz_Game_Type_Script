import {getRedisClient} from "../../redis/RedisConfig/redis.config";
import asyncWrapper from "../../middleware/wrappers/async.wrapper";

export const renewRoom = asyncWrapper(async (roomId) => {
    const redisClient = await getRedisClient()

    redisClient.exists(roomId, async (err) => {
        if (err) {
            throw new Error('session expired please try again' + err)
        }

        redisClient.expire(roomId, 3 * 60)
    })
})