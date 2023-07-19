const typeORM = require("typeorm");
const {dataSource} = require('../../dbconfig/data-source')

async function registerUser(req, res, username, passwd) {
    try {
        const newUser = {
            username: username,
            password: passwd
        }
        const userRepository = dataSource.getRepository("user")
            userRepository
                .save(newUser)
                .then(function (savedUsers) {
                    console.log("User has been saved: ", savedUsers)
                    console.log("Now lets load all Users: ")
                    return userRepository.find()
                })
                .then(function (allPosts) {
                    console.log("All posts: ", allPosts)
                    // dataSource.close()
                    res.status(201).send('User Created Successfully')
                })
                .catch(function (error) {
                    console.log(`Creation Error is : ${error}`)
                    res.status(401).send('username exists')
                })
    } catch (err) {
        console.log(`creation err is ${err}`);
    }
}

module.exports = {
    registerUser
}