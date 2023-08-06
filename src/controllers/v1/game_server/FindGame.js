const {dataSource} = require('../../../../dbconfig/data-source')
require('dotenv').config()

async function findGame(id) {
    if (!id) {
        console.log('empty game id my dear !')
    }
    const gameRepository = await dataSource.getRepository("game")
    try {
        const foundGame = await gameRepository.findOneOrFail({
            where: {
                id
            }
        })
        // console.log(foundGame)
        return foundGame
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    findGame
}
