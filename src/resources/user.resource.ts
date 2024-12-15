import {User} from "../../database/entity/User";
import {gameRoomCollectionResource} from "./game.room.collection.resource";

export const userResource = (user: User) => {
    return {
        userId: user.id,
        username: user.username,
        totalPoints: user.total_points,
        gameRooms: user.gameRooms ? gameRoomCollectionResource(user.gameRooms) : null
    }
}