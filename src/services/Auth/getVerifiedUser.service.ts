const jwt = require("jsonwebtoken");

export const getVerifiedUserService = async (accessToken) => {
    let verifiedUser

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        verifiedUser = user
    })

    return verifiedUser
}
