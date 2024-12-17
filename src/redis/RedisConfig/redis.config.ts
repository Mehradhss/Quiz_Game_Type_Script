import Redis, {RedisOptions} from "ioredis";
import retry from "async-retry";
import {roomExpired} from "../../services/Redis/redis.room.expired.service";
import {endGame} from "../../services/Game/game.end.service";
import {dataSource} from "../../../database/DataSource";
import {Game} from "../../../database/entity/Game";

let redisClient: Redis;

let subscriber: Redis

async function createRedisClient() {
    const options: RedisOptions = {
        host: process.env.REDIS_HOST, // Replace 'your_redis_host' with your Redis host
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10), // Replace with your Redis port if it's different
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
    const retryOptions = {
        factor: 2, // Exponential backoff factor
        minTimeout: 1000, // Minimum timeout in milliseconds
        maxTimeout: 5000, // Maximum timeout in milliseconds
        randomize: true, // Randomize retry times
        onRetry: (err: any) => {
            console.log(`[${Date.now()}]`, 'redis connection error : ', err)
        }
    }
    await retry(async (bail) => {
        redisClient = new Redis(options)
        subscriber = redisClient.duplicate(); // Duplicate connection for pub/sub

        redisClient.config("SET", "notify-keyspace-events", "Ex");

        subscriber.subscribe(`__keyevent@0__:expired`);
        await subscriber.on('message', async (channel, expiredKey) => {
            try {
                console.log("new message coming form redis : ", expiredKey)

                const splitKey = expiredKey.split('.')

                const expiredKeyEntity = splitKey[0]

                switch (expiredKeyEntity) {
                    case 'room':
                        const roomUuid = splitKey[1]
                        await roomExpired(roomUuid)
                        break
                    case 'started':
                        const gameId = splitKey[1]
                        const game = await dataSource.getRepository(Game).findOne({
                            where: {
                                id: parseInt(gameId)
                            },
                            relations: ["gameRoom", "users", "winner"]
                        });

                        if (game.status != "FINISHED") {
                            await endGame(game, "FINISHED")
                        }

                        break;
                    default:
                        break
                }
            } catch (e) {
                console.log(e)
            }
        })

        console.log(`[${Date.now()}]`, 'redis connected successfully')
    }, retryOptions)
}

function getRedisClient() {
    if (!redisClient) {
        throw new Error('no redis client found')
    }

    return redisClient
}

function getRedisSubscriber() {
    if (!subscriber) {
        throw new Error('no redis client found')
    }

    return subscriber
}

export {
    getRedisClient,
    createRedisClient,
    getRedisSubscriber
}