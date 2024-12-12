import {dataSource} from "../../../database/DataSource";
import {Game} from "../../../database/entity/Game";
import {User} from "../../../database/entity/User";
import {getSocketUser} from "../Redis/redis.get.user.service";
import {GameRoom} from "../../../database/entity/GameRoom";

export default async function createGame(roomId, socketId, status) {
    try {
        const socketUserId = await getSocketUser(socketId)

        const newGame = new Game()
        newGame.status = status

        const userRepository = await dataSource.getRepository(User)
        const user = await userRepository.findOneOrFail({
            where: {id: parseInt(socketUserId)},
            relations: ["games"]
        }).then(user => {
            return user
        })
        user.games.push(newGame)

        const gameRoomRepository = await dataSource.getRepository(GameRoom)
        const gameRoom = await gameRoomRepository.findOneOrFail({
            where: {
                uuid: roomId
            }
        })
        gameRoom.games.push(newGame)

        await dataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                await transactionalEntityManager.save(newGame)
                await transactionalEntityManager.save(user)
                await transactionalEntityManager.save(gameRoom)
            } catch (e) {
                throw e
            }
        })

        return newGame
    } catch (err) {
        console.log(`creation err is ${err}`);
    }
}
