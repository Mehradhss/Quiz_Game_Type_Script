import {dataSource} from "../../../database/DataSource";
import {User} from "../../../database/entity/User";

const jwt = require("jsonwebtoken");

export const getVerifiedUserService = async (accessToken) => {
    let verifiedUser

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        verifiedUser = user
    })

    const user = await dataSource.getRepository(User).findOneOrFail({
        where : {
            id : verifiedUser.userId
        } ,
        relations : ["gameRooms" , "games"]
    })

    return user
}
