const {dataSource} = require("../../../database/DataSource");
async function startGame( id, guest_id ,status) {
    try {
        const gameRepository = await dataSource.getRepository("game")
        const foundGame = await gameRepository.findOneOrFail({
            where: {
                id
            }
        })
        foundGame.guest_id = guest_id
        foundGame.status = status

        await gameRepository
            .save(foundGame).then((savedGame) => {
                console.log('Game Updated Successfully')
            })
    } catch (err) {
        console.log(`creation err is ${err}`);
    }
}

module.exports = {
    startGame
}