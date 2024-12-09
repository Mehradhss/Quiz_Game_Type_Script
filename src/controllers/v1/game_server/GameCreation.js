const {dataSource} = require('../../../../database/DataSource')

let foundGame

async function createGame( hostid ,status) {
    try {
        const newGame = {
            host_id: hostid,
            status: status
        }
        const gameRepository = await dataSource.getRepository("game")
        await gameRepository
            .save(newGame).then((savedGame) => {
                console.log(savedGame)
                foundGame = savedGame
            })
        return foundGame
    } catch (err) {
        console.log(`creation err is ${err}`);
    }
}

module.exports = {
    createGame
}