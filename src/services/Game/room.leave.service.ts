import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import {endGame} from "./game.end.service";

export const leaveRoom = async (gameRoom: GameRoom, userId, finishedStatus) => {
    try {
        gameRoom.users = gameRoom.users.filter((gameRoomUser) => {
            return gameRoomUser.id != userId
        })

        await gameRoom.games.forEach(async (game) => {
            if (game.users.some(gameUser => gameUser.id = userId)) {
                if (game.status === "STARTED") {
                    await endGame(game, finishedStatus);
                }
            }
        })

        await dataSource.manager.save(gameRoom)

        return gameRoom

    } catch (e) {
        throw e
    }
}