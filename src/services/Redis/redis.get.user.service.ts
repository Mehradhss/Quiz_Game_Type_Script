import {getRedisClient} from "../../RedisConfig/RedisConfig";

export const getSocketUser = async (socketId) => {
    try {
        const redisClient = await getRedisClient()

        const socketUserId = await redisClient.get(socketId, err => {
            if (err) {
                throw new Error('error fetching user id for game creation' + err)
            }
        })

        return socketUserId;
    } catch (e) {
        throw new Error(e.message)
    }
}