import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {endGame} from "./game.end.service";

export const leaveGame = async (game: Game, userId: number) => {
    game.users = game.users.filter((user) => {
        return user.id != userId;
    })

    await dataSource.manager.save(game)

    await endGame(game , "FINISHED")
}