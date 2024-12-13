import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";

const getJoinAbleGameRoom = async function (userId) {
    const gameRoomRepository = await dataSource.getRepository(GameRoom);

    const foundGameRoom = await gameRoomRepository
        .createQueryBuilder('gameRooms')
        .leftJoinAndSelect('gameRooms.users', 'users')
        .groupBy('gameRooms.id')
        .having('COUNT(users.id) < 2')
        .andWhere('users.id IS NULL OR users.id != :userId', {userId: userId})
        .getOne();

    return foundGameRoom;
};

const getEmptyGameRoom = async function () {
    try {
        const gameRoomRepository = await dataSource.getRepository(GameRoom);

        const foundGameRoom = await gameRoomRepository
            .createQueryBuilder('gameRooms')
            .leftJoinAndSelect('gameRooms.users', 'users')
            .groupBy('gameRooms.id')
            .having('COUNT(users.id) = 0')
            .getOne();

        return foundGameRoom;
    } catch (e) {
        console.log("error in finding empty game room", e);
        throw e;
    }
}

export {
    getEmptyGameRoom ,
    getJoinAbleGameRoom
}