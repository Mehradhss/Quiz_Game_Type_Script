import {dataSource} from "../../../database/DataSource";
import {GameRoom} from "../../../database/entity/GameRoom";

export default async function isUserJoined(gameRoom : GameRoom, userId) {
    return gameRoom.users.some(user => user.id === userId)
}
