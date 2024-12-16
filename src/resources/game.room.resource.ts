import {GameRoom} from "../../database/entity/GameRoom";
import {gameCollectionResource} from "./game.collection.resource";
import {userCollectionResource} from "./user.collection.resource";

export const gameRoomResource = (gameRoom: GameRoom) => {
    return {
        id: gameRoom.id,
        name: gameRoom.uuid,
        games: gameRoom.games ? gameCollectionResource(gameRoom.games) : null,
        users: gameRoom.users ? userCollectionResource(gameRoom.users) : null,
    }
}