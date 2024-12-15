import {User} from "../../database/entity/User";

export const userCollectionResource = (users: User[]) => {
    return users.map((user) => {
        return {
            userId: user.id,
            username: user.username,
            totalPoints: user.total_points
        }
    })
}