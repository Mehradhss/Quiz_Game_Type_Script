import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";

export default async function getGameRoom(userId) {
    const gameRoomRepository = await dataSource.getRepository(GameRoom);

    const foundGameRoom = await gameRoomRepository
        .createQueryBuilder('gameRooms')
        .leftJoinAndSelect('gameRooms.users', 'users')
        .groupBy('gameRooms.id')
        .having('COUNT(users.id) < 2')
        .andWhere('users.id IS NULL OR users.id != :userId', {userId: userId})
        .getOne();

    return foundGameRoom;
}
