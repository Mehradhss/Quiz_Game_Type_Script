import {dataSource} from "../../../database/DataSource";
import {getRedisClient} from "../../RedisConfig/RedisConfig";
import {Game} from "../../../database/entity/Game";
import {User} from "../../../database/entity/User";

export default async function createGame(roomId, socketId, status) {
    try {
        const redisClient = await getRedisClient();

        const socketUserId = await redisClient.get(socketId, err => {
            if (err) {
                throw new Error('error fetching user id for game creation' + err)
            }
        })

        const newGame = new Game()
        newGame.status = status

        const userRepository = await dataSource.getRepository(User)
        const foundUser = await userRepository.findOneOrFail({where: {id: parseInt(socketUserId)} , relations: ["games"]}).then(user => {
            return user
        })
        foundUser.games.push(newGame)

        await dataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                await transactionalEntityManager.save(newGame)
                await transactionalEntityManager.save(foundUser)
            } catch (e) {
                throw e
            }
        })

        redisClient.set(newGame.id.toString(), roomId.toString(), (err) => {
            if (err) {
                console.error('Error saving data to Redis:', err);
                throw err;
            }
        })

        return newGame
    } catch (err) {
        console.log(`creation err is ${err}`);
    }
}
