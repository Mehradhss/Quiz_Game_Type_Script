const typeORM = require("typeorm");
const {dataSource} = require('../../dbconfig/data-source')

async function testingGame() {
    try {
        const newGame = {
            host_id : 1,
            guest_id :2
        }
        const userRepository = dataSource.getRepository("game")
        userRepository
            .save(newGame)
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
    testingGame
}