import {User} from "../../database/entity/User";

export const userResource = (user: User) => {
    return {
        userId: user.id,
        username: user.username,
        totalPoints: user.total_points
    }
}