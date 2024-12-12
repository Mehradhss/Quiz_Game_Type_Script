import {dataSource} from "../../../database/DataSource";
import {Game} from "../../../database/entity/Game";
import {getRedisClient} from "../../RedisConfig/RedisConfig";
import {User} from "../../../database/entity/User";

export default async function getGame(socketId, status) {
    const redisClient = await getRedisClient()

    const socketUserId = await redisClient.get(socketId, err => {
        if (err) {
            throw new Error('error fetching user id for game creation' + err)
        }
    })

    const foundUserGameIds = await dataSource.getRepository(User)
        .findOneOrFail({where: {id: parseInt(socketUserId)}, relations: ["games"]})
        .then(user => {
            return user.games.map(game => {
                return game.id
            })
        })

    const gameQuery = await dataSource.getRepository(Game).createQueryBuilder('games')
        .leftJoinAndSelect('games.gameRooms', 'gameRooms')
        .where('games.status = :status', {status})

    if (foundUserGameIds.length > 0) {
        gameQuery.andWhere("games.id NOT IN (:...ids)", {ids: foundUserGameIds});
    }

    return gameQuery.getOne();
}
