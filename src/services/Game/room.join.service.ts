import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";
import {Socket} from "socket.io";
import {User} from "../../../database/entity/User";
import {getSocketUser} from "../Redis/redis.get.user.service";


export default async function joinRoom(socket : Socket , roomUuid) {
    const gameRoomRepository  =  await dataSource.getRepository(GameRoom)
    const userRepository = await dataSource.getRepository(User)

    const gameRoom = await gameRoomRepository.findOneOrFail({
        where: {
            uuid: roomUuid
        }
    });

    const userId = await getSocketUser(socket.id);

    const user = await userRepository.findOneOrFail({
        where: {
            id: userId
        }
    }).then(user => {
        return user
    })
    user.gameRooms.push(gameRoom)

    await dataSource.manager.transaction(async (transactionalEntityManager) => {
        try {
            await transactionalEntityManager.save(user)
        } catch (e) {
            throw e
        }
    })

    socket.join(roomUuid)
}