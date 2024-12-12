import {dataSource} from "../../../database/DataSource";
import {getRedisClient} from "../../RedisConfig/RedisConfig";

async function gameInit(id, status, user_id) {
    try {
        const redisClient = await getRedisClient()

        const gameRepository = await dataSource.getRepository("game")

        const foundGame = await gameRepository.findOneOrFail({
            where: {
                id
            }
        })

        foundGame.status = status
        const newGamePoint = {
            game_id: id,
            user_id: user_id
        }
        await gameRepository.save(foundGame).then((savedGame) => {
            console.log('Game Started Successfully')
        })
        await gamePointRepository.save(newGamePoint)
    } catch (err) {
        console.log(`starting err is ${err}`);
        throw err
    }
}

module.exports = {
    gameInit
}