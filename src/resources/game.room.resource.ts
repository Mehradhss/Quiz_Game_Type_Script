import {GameRoom} from "../../database/entity/GameRoom";

export const gameRoomResource = (gameRoom: GameRoom) => {
    return {
        id: gameRoom.id,
        name: gameRoom.uuid
    }
}