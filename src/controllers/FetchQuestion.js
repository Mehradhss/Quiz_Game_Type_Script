// Function to get a random question ID from a specific category
const {dataSource} = require('../../dbconfig/data-source')

let foundQuestion

async function getQuestion(game_id , availableQuestions) {
    try {
        // const game_questionRepository = await dataSource.getRepository("game_question")
        // console.log(game_id)
        // const gameRepository = await dataSource.getRepository('game')

        try {
            // foundGame = await gameRepository.findOneOrFail({where: {id: game_id}, relations: ['questions']})
            // const randomIndex = Math.floor(Math.random() * foundGame.questions.length)
            const randomIndex = Math.floor(Math.random() * availableQuestions.length)

            const randomQuestion = availableQuestions[randomIndex]
            foundQuestion = randomQuestion
        } catch (error) {
            console.log(error)
        }

        // const getQuestion = await gameRepository
        //     .createQueryBuilder('game')
        //     .select( )
        //     //.leftJoinAndSelect('game.questions', 'question')
        //     .where("game.id LIKE :GameId", {GameId: `%${game_id}%`})
        //     .getOne().then((fetched) => {
        //         foundQuestion = fetched
        //     })
        return foundQuestion
    } catch (error) {
        console.log('fetch question error is : ${error}')
    }
}

module.exports = {
    getQuestion
}

