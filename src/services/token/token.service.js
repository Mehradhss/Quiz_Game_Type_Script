const jwt = require("jsonwebtoken");

module.exports = function createToken(user){
    const payload = {
        id: user.id,
    }
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
}