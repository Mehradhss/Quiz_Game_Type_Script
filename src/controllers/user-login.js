const {dataSource} = require('../../dbconfig/data-source')
const jwt = require('jsonwebtoken')
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
            const user = {username: foundUser.username}
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.status(200)
                // .send("logged in succesfully ! ");
                .json({
                    "token": accessToken
                })
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
