// Function to get a random question ID from a specific category
const {dataSource} = require('../../dbconfig/data-source')

let foundQuestion

async function getQuestion( game_id) {
    try {

        // const game_questionRepository = await dataSource.getRepository("game_question")
        console.log(game_id)
        const gameRepository = await dataSource.getRepository('game')
        const gameAnswerRepository = await dataSource.getRepository('game_answer')
        const foundGame = await gameRepository.findOneOrFail({where: {id: game_id}, relations: ['questions']})
        console.log(foundGame)
        try {


            let availableQuestions = foundGame.questions
            // console.log("a is " ,foundGame.questions[0])
            // const randomIndex = Math.floor(Math.random() * foundGame.questions.length)
            const getQuestion = await gameRepository
            //     .createQueryBuilder('game')
            //     .select('game_question_id')
            //     .leftJoin/*AndSelect*/('game.answers', 'game_answer')
            //     .where("game.id LIKE :GameId", {GameId: '${game_id}%}'})
            //     .getMany().then(async (fetched) => {
            //         // await fetched.forEach(async (question) => {
            //         //     fetched
            //         //     await availableQuestions.questions.push(question)
            //         console.log('found is ', fetched)
            //         })
                    // sentQuestions = fetched
                //     console.log("sent Questions is :" , sentQuestions)
                // })
                .createQueryBuilder('game')
                .select('question')
                .leftJoin/*AndSelect*/('game.questions', 'question')
                .where('game.id = :GameId', { GameId: 1 })
                // .andWhere('question.id = :questionId', { questionId })
                .getMany();
            console.log('get Question is ' ,getQuestion)
            const randomIndex = Math.floor(Math.random() * availableQuestions.length)

            const randomQuestion = availableQuestions[randomIndex]
            foundQuestion = randomQuestion
        } catch (error) {
            console.log(error)
        }
        const newgameQuestion = {
            game_id :game_id ,
            game_question_id : foundQuestion.id
        }
        await gameAnswerRepository.save(newgameQuestion)
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
        console.log(`fetch question error is : ${error}`)
    }
}

module.exports = {
    getQuestion
}

