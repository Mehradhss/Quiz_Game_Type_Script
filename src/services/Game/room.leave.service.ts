import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import {endGameWithWinner} from "./game.end.service";

export const leaveRoom = async (gameRoom: GameRoom, userId, finishedStatus) => {
    try {
        gameRoom.users = gameRoom.users.filter((gameRoomUser) => {
            return gameRoomUser.id != userId
        })

        await dataSource.manager.save(gameRoom)

        await gameRoom.games.forEach(async (game) => {
            if (game.users.some(gameUser => gameUser.id = userId)) {
                if (game.status === "STARTED") {
                    await endGameWithWinner(game, finishedStatus, gameRoom.users[0]);
                }
            }
        })

        return gameRoom

    } catch (e) {
        throw e
    }
}