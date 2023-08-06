const asyncHandler = require("express-async-handler")
const login = require("../../../services/user/login.service");
const {createServer} = require('../game_server/Connection')

exports.login_user = asyncHandler (async (req , res) => {
        const body = {...req.body}
        try {
            await login.userLoginService(req, res, body.username, body.password)
        } catch (error) {
            res.status(408).send()
            console.log('error getting request body' + error)
        }
})