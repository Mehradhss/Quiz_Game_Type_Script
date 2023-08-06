const {dataSource} = require('../../../dbconfig/data-source')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
require('dotenv').config()

exports.userLoginService = asyncHandler (async (req, res, username, password) => {
    if (!(username && password)) {
        res.status(400).send();
    }

    console.log(username, password)
    const userRepository = await dataSource.getRepository("user")
    try {
        const foundUser = await userRepository.findOneOrFail({
            where: {
                username,
                password
            }
        })
        if (foundUser) {
            const user = {id: foundUser.id}
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.status(200).json({
                    "token": accessToken
                })
        }

    } catch (error) {
        res.status(401).send("username or password incorrect ! ")
        throw error
    }
})

