import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import {User} from "../../../database/entity/User";

export const leaveRoom = asyncWrapper(async (roomUuid: string, userId, finishedStatus) => {
    const gameRoomRepository = await dataSource.getRepository(GameRoom);

    const gameRoom = await gameRoomRepository.findOneOrFail({
        where: {
            uuid: roomUuid
        },
        relations: ["users", "games", "games.users"]
    });

    gameRoom.users.filter((gameRoomUser) => {
        return gameRoomUser.id != userId
    })

    gameRoom.games.forEach((game) => {
        if (game.users.some(gameUser => gameUser.id = userId)) {
            game.status = finishedStatus;
        }
    })

    await dataSource.manager.save(gameRoom)
})