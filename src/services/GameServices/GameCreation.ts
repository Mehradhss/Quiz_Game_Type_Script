import {dataSource} from "../../../database/DataSource";

let foundGame

export default async function createGame(hostId, status) {
    try {
        const newGame = {
            host_id: hostId,
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
