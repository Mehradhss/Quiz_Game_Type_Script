import {User} from "../../database/entity/User";
import {userCollectionResource} from "./user.collection.resource";

export const leaderboardResource = (users: User[]) => {
    return {
        users: userCollectionResource(users)
    }
}