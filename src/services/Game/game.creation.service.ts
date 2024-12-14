import {dataSource} from "../../../database/DataSource";
import {Game} from "../../../database/entity/Game";
import {User} from "../../../database/entity/User";
import {GameRoom} from "../../../database/entity/GameRoom";
import {Category} from "../../../database/entity/Category";

export default async function createGame(gameRoom: GameRoom, status, categoryId) {
    try {
        const roomUsers = gameRoom.users

        const category = await dataSource.getRepository(Category).findOneOrFail({
            where: {
                id: categoryId
            }
        })
        const newGame = new Game()
        newGame.status = status

        newGame.category = category

        await roomUsers.forEach((user: User) => {
            user.games.push(newGame)
        })

        gameRoom.games.push(newGame)

        await dataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                await transactionalEntityManager.save(newGame)
                await transactionalEntityManager.save(roomUsers)
                await transactionalEntityManager.save(gameRoom)
            } catch (e) {
                throw e
            }
        })

        return newGame
    } catch (err) {
        console.log(`game creation err is ${err}`);
        throw err
    }
}
