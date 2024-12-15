import {GameRoom} from "../../database/entity/GameRoom";
import {gameRoomResource} from "./game.room.resource";

export const gameRoomCollectionResource = (gameRooms: GameRoom[]) => {
    return gameRooms.map((gameRoom) => {
        return gameRoomResource(gameRoom)
    })
}