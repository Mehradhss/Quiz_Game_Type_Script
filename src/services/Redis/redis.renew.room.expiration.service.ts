import {getRedisClient} from "../../RedisConfig/RedisConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";

export const renewRoom = asyncWrapper(async (roomId) => {
    const redisClient = await getRedisClient()

    redisClient.exists(roomId, async (err) => {
        if (err) {
            throw new Error('session expired please try again' + err)
        }

        redisClient.expire(roomId, 3 * 60)
    })
})