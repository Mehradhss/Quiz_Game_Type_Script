import {dataSource} from "../../../database/DataSource";
import {Game} from "../../../database/entity/Game";
import {getRedisClient} from "../../RedisConfig/RedisConfig";
import {User} from "../../../database/entity/User";
import {getSocketUser} from "../Redis/redis.get.user.service";
import {GameRoom} from "../../../database/entity/GameRoom";

export default async function getGameRoom(userId, status) {
    const redisClient = await getRedisClient()

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
