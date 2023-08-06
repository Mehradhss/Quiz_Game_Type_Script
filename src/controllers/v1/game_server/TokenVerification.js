const jwt = require("jsonwebtoken");
function verify(accessToken) {
    let verifiedUser
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // if (err) res.status(401).json({
        //     "Verification": "failed"
        // })
        verifiedUser = user

    })
    return verifiedUser
}
module.exports = {
    verify
}