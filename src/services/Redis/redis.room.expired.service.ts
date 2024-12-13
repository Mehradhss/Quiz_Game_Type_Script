import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";

export const roomExpired = asyncWrapper(async (roomId) => {
    const gameRoomRepository = await dataSource.getRepository(GameRoom);

    const gameRoom = await gameRoomRepository.findOneOrFail({
        where: {
            id: roomId
        },
        relations: ["users"]
    });

    gameRoom.users = [];

    await gameRoomRepository.save(gameRoom)
});