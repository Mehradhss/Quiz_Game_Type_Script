import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import {User} from "../../../database/entity/User";
import {endGame} from "./game.end.service";

export const leaveRoom = async (gameRoom: GameRoom, userId, finishedStatus) => {
    try {
        const gameRoomRepository = await dataSource.getRepository(GameRoom);

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