const {dataSource} = require('../../dbconfig/data-source')
const jwt = require('jsonwebtoken')
const {createSocketConnection} = require("./Connection");
const {server} = require("../server");
require('dotenv').config()

async function login(req, res, username, password) {
    if (!(username && password)) {
        res.status(400).send();
    }

    console.log(username, password)
    const userRepository = dataSource.getRepository("user")
    try {
        const foundUser = await userRepository.findOneOrFail({
            where: {
                username,
                password
            }
        });
        if (foundUser) {
            const user = {id: foundUser.id}
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            // createSocketConnection(server, accessToken)
            res
                // .send("logged in succesfully ! ");
                .status(200)
                .json({
                    "token": accessToken
                })
            // .redirect(200, '/verify')
        }

        console.log(foundUser)
    } catch (error) {
        res.status(401)
            .send("username or password incorrect ! ")
    }
}

module.exports = {
    login
}
