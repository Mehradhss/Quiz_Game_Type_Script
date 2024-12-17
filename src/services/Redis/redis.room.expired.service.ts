import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import asyncWrapper from "../../middleware/wrappers/async.wrapper";

export const roomExpired = asyncWrapper(async (roomId) => {
    const gameRoomRepository = await dataSource.getRepository(GameRoom);
    console.log(roomId)
    const gameRoom = await gameRoomRepository.findOneOrFail({
        where: {
            uuid: roomId
        },
        relations: ["users"]
    });

    gameRoom.users = [];

    await gameRoomRepository.save(gameRoom)
});