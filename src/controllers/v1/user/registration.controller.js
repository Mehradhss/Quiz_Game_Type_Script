const register = require("../../../services/user/registration.service");
const createToken = require("../../../services/token/token.service");
const asyncHandler = require("express-async-handler");

exports.register_user = asyncHandler(async (req, res) => {
    //validate user input

    const body = {...req.body}
    try {
        const user = await register(body)
        const token = await createToken(user)
        const response = {
            username: user.username,
            token: token
        }
        res.json(response);
    } catch (error) {
        res.status(500).send()
        console.log(error)
    }
})