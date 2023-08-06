const {dataSource} = require('../../../../dbconfig/data-source')
const asyncHandler = require("express-async-handler")

exports.submitAnswer = asyncHandler(async (game_id, game_question_id, answer_id, user_id) => {
    try {
        const questionRepository = await dataSource.getRepository("question")
        const gamePointsRepository = await dataSource.getRepository('game_point')
        const userGamePoint = await gamePointsRepository.findOneOrFail({
            where: {
                game_id: game_id,
                user_id: user_id
            }
        })
        const gameAnswerRepository = await dataSource.getRepository('game_answer')
        const foundGameAnswer = await gameAnswerRepository.findOneOrFail({
            where: {game_id: game_id, game_question_id: game_question_id},
            relations: ['questions']
        })
        if (answer_id !== -1) {
            const foundQuestion = await questionRepository.findOneOrFail({
                where: {id: game_question_id},
                relations: ['answers']
            })
            const foundAnswer = await foundQuestion.answers.find(answer => answer.id === answer_id)
            foundGameAnswer.received_answer_id = answer_id
            await gameAnswerRepository.save(foundGameAnswer)
            console.log(`found answer is ${foundAnswer.is_correct}`)
            if (foundAnswer.is_correct) {
                userGamePoint.points += 10
                await gamePointsRepository.save(userGamePoint)
            }
        } else {
            foundGameAnswer.received_answer_id = null
            await gameAnswerRepository.save(foundGameAnswer)
        }
    } catch (error) {
        console.log(`submit answer error is : ${error}`)
        throw error
    }
})