import {User} from "../../database/entity/User";
import {gameRoomCollectionResource} from "./game.room.collection.resource";
import {gameCollectionResource} from "./game.collection.resource";

export const userResource = (user: User) => {
    return {
        userId: user.id,
        isAdmin: user.isAdmin,
        username: user.username,
        totalPoints: user.total_points,
        gameRooms: user.gameRooms ? gameRoomCollectionResource(user.gameRooms) : null,
        games: user.games ? gameCollectionResource(user.games) : null
    }
}