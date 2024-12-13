import generateRoomUuId from "./RoomCreation";
import {getSocketUser} from "../Redis/redis.get.user.service";
import {dataSource} from "../../../database/DataSource";
import {User} from "../../../database/entity/User";
import {GameRoom} from "../../../database/entity/GameRoom";

export default async function createRoom(userId) {
    const userRepository = await dataSource.getRepository(User)

    const uuId = generateRoomUuId();
    const newRoom = new GameRoom()
    newRoom.uuid = uuId

    const foundUser = await userRepository.findOneOrFail({where: {id: userId}, relations: ["gameRooms"]})
    foundUser.gameRooms.push(newRoom)

    await dataSource.manager.transaction(async (transactionalEntityManager) => {
        try {
            await transactionalEntityManager.save(newRoom)
            await transactionalEntityManager.save(foundUser)
        } catch (e) {
            throw e
        }
    })

    return newRoom;
}
