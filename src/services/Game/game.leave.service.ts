import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {endGameWithWinner} from "./game.end.service";

export const leaveGame = async (game: Game, userId: number) => {
    game.users = game.users.filter((user) => {
        return user.id != userId;
    })

    await dataSource.manager.save(game)

    await endGameWithWinner(game, "FINISHED", game.users[0])
}