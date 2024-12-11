import {dataSource} from "../../../database/DataSource";


export const gameFinal = async function (id: number) {
    return new Promise(async (resolve, reject) => {
        try {
            const gamePointRepository = await dataSource.getRepository("game_point")

            const foundGamePoint = await gamePointRepository.find({
                where: {
                    game_id: id,
                    is_finished: true
                }
            })

            const length = foundGamePoint.length

            if (length === 2) {
                const gameRepository = await dataSource.getRepository("game")
                const foundGame = await gameRepository.findOneOrFail({
                    where: {
                        id
                    }
                })

                foundGame.status = status

                foundGame.game_winner_id = foundGamePoint[0] < foundGamePoint[1] ? foundGamePoint[1].user_id : foundGamePoint[0].user_id

                const currentDate = new Date();

                foundGame.finishedAt = currentDate

                await gameRepository.save(foundGame).then((savedGame) => {
                    console.log('Game finished Successfully')
                })

                resolve (true)
            } else {
                resolve (false)
            }
        } catch (err) {
            console.log(`starting err is ${err}`);
            throw err
        }
    })
};
