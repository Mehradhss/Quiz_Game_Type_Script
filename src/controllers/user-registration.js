const typeORM = require("typeorm");
const {dataSource} = require('../../dbconfig/data-source')

async function registerUser(username, passwd) {
    try {
        const newUser = {
            username: username,
            password: passwd
        }
        const userRepository = dataSource.getRepository("user")
        userRepository
            .save(newUser)
            .then(function (savedUsers) {
                console.log("Post has been saved: ", savedUsers)
                console.log("Now lets load all posts: ")
                return userRepository.find()
            })
            .then(function (allPosts) {
                console.log("All posts: ", allPosts)
                // dataSource.close()
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    } catch (err) {
        console.log(err);
    }

}

module.exports = {
    registerUser
}