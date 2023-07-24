const {dataSource} = require("../../dbconfig/data-source");
async function gameInit( id , status) {
    try {
        const gameRepository = await dataSource.getRepository("game")
        const foundGame = await gameRepository.findOneOrFail({
            where: {
                id
            }
        })
        foundGame.status = status

        await gameRepository
            .save(foundGame).then((savedGame) => {
                console.log('Game Started Successfully')
            })
    } catch (err) {
        console.log(`starting err is ${err}`);
    }
}

module.exports = {
    gameInit
}