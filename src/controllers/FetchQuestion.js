// Function to get a random question ID from a specific category
const {dataSource} = require('../../dbconfig/data-source')

let foundQuestion

async function getGameQuestion(game_id) {
    try {
        console.log('game id is ' , game_id)
        const gameRepository = await dataSource.getRepository('game')
        const gameAnswerRepository = await dataSource.getRepository('game_answer')
        const foundGame = await gameRepository.findOneOrFail({where: {id: game_id}, relations: ['questions']})
        const questionRepository = await dataSource.getRepository('question')
        console.log(foundGame)
        try {

                let availableQuestions = foundGame.questions
                // const gameRepository = await dataSource.getRepository('game')
                // const game_AnswerRepository = await dataSource.getRepository('game_answer')
                const fetchedQuestion = await gameAnswerRepository
                    .createQueryBuilder('game_answer')
                    .select('game_answer.game_question_id')
                    .leftJoin('game_answer.games', 'game')
                    .where('game_answer.game_id = :GameId',  { GameId: 1 })
                    .getMany().then(async (fetched) =>{
                        // console.log(fetched)
                        // let sentQuestions = await questionRepository.find()
                        // let temp = gameQuestions
                        // let temp2 =[]
                        let counter = fetched.length
                        // console.log('temp before is : ', temp)
                        while(counter !== 0) {
                            const questions = await questionRepository.find({
                                where: {
                                    id: fetched[counter-1].game_question_id
                                }
                            })
                            // console.log(questions[0])
                            const tempIndex = availableQuestions.findIndex((question) => question.id === questions[0].id);
                            if (tempIndex > -1) {
                                availableQuestions.splice(tempIndex, 1); // Remove the question at the found index
                            }
                            counter --
                        }
                        console.log('available questions is ',availableQuestions )

                    })
            // const getGameQuestion = await gameRepository
            //     .createQueryBuilder('game')
            //     // .select('question')
            //     .leftJoinAndSelect('game.questions', 'question')
            //     .where('game.id = :GameId', { GameId: 1 })
            //     .getMany();
            // console.log('get Question is ' ,getGameQuestion)
            const randomIndex = Math.floor(Math.random() * availableQuestions.length)

            const randomQuestion = availableQuestions[randomIndex]
            foundQuestion = randomQuestion
            const newgameQuestion = {
                game_id :game_id ,
                game_question_id : foundQuestion.id
            }
            await gameAnswerRepository.save(newgameQuestion)
            // const getGameQuestion = await gameRepository
            //     .createQueryBuilder('game')
            //     .select( )
            //     //.leftJoinAndSelect('game.questions', 'question')
            //     .where("game.id LIKE :GameId", {GameId: `%${game_id}%`})
            //     .getOne().then((fetched) => {
            //         foundQuestion = fetched
            //     })
            return foundQuestion
        } catch (error) {
            console.log(error)
        }
        // const newgameQuestion = {
        //     game_id :game_id ,
        //     game_question_id : foundQuestion.id
        // }
        // await gameAnswerRepository.save(newgameQuestion)
        // // const getGameQuestion = await gameRepository
        // //     .createQueryBuilder('game')
        // //     .select( )
        // //     //.leftJoinAndSelect('game.questions', 'question')
        // //     .where("game.id LIKE :GameId", {GameId: `%${game_id}%`})
        // //     .getOne().then((fetched) => {
        // //         foundQuestion = fetched
        // //     })
        // return foundQuestion
    } catch (error) {
        console.log(`fetch question error is : ${error}`)
    }
}

module.exports = {
    getGameQuestion
}

