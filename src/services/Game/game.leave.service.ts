import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";

export const leaveGame = async (game: Game, userId: number) => {
    game.users.filter((user) => {
        return user.id != userId;
    })

    await dataSource.manager.save(game)

    game.winner = game.users[0]

    await dataSource.manager.save(game)
}