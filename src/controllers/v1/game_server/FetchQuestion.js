// Function to get a random question ID from a specific category
const {dataSource} = require('../../../../database/DataSource')

let foundQuestion

async function getGameQuestion(gameId, userId) {
    try {
        // console.log('game id is ', gameId)
        const gameRepository = await dataSource.getRepository('game')
        const foundGame = await gameRepository.findOneOrFail({where: {id: gameId}, relations: ['questions']})
        // console.log(foundGame)
        let availableQuestions = foundGame.questions


            const gameAnswerRepository = await dataSource.getRepository('game_answer')
            const questionRepository = await dataSource.getRepository('question')
                const fetchedQuestion = await gameAnswerRepository
                    .createQueryBuilder('game_answer')
                    .select('game_answer.game_question_id')
                    .leftJoin('game_answer.games', 'game')
                    .where('game_answer.game_id = :gameId', {gameId: gameId})
                    .andWhere('game_answer.player_id = :playerId' , {playerId: userId})
                    .getMany().then(async (fetched) => {
                        let counter = fetched.length
                        if (counter !== 0) {
                            while (counter !== 0) {
                                const questions = await questionRepository.findOneOrFail({
                                    where: {
                                        id: fetched[counter - 1].game_question_id
                                    }
                                })
                                    const tempIndex = availableQuestions.findIndex((question) => question.id === questions.id)
                                    if (tempIndex > -1) {
                                        availableQuestions.splice(tempIndex, 1); // Remove the question at the found index
                                    }
                                counter--
                            }
                            // console.log('available questions is ', availableQuestions)
                        }

                    })

        // if (availableQuestions !== null) {

            const randomIndex = Math.floor(Math.random() * availableQuestions.length)

            const randomQuestion = availableQuestions[randomIndex]
            foundQuestion = randomQuestion
            const newgameQuestion = {
                game_id: gameId,
                game_question_id: foundQuestion.id,
                player_id: userId
            }
            await gameAnswerRepository.save(newgameQuestion)
        console.log('debug ' , foundQuestion)
        if (!foundQuestion){

        }

            return foundQuestion
        // }else {
        //     console.log('resid be inja !')
        //     const gamePointRepository = await dataSource.getRepository('game_point')
        //     foundGamePoint = await gamePointRepository.findOneOrFail({where : {
        //         user_id: userId
        //         }})
        //     foundGamePoint.is_finished = 'FINISHED'
        //     await gamePointRepository.save(foundGamePoint)
        //     return -1
        // }
    } catch (error) {
        // console.log(`fetch question error is : ${error}`)
        console.log('resid be inja !')
        const gamePointRepository = await dataSource.getRepository('game_point')
        foundGamePoint = await gamePointRepository.findOneOrFail({where : {
                game_id: gameId,
                user_id: userId
            }})
        foundGamePoint.is_finished = true
        await gamePointRepository.save(foundGamePoint)
    }
}

module.exports = {
    getGameQuestion
}

