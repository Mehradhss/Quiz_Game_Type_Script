import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {GameQuestion} from "../../../database/entity/GameQuestion";
import {Answer} from "../../../database/entity/Answer";
import {QuestionResult} from "../../../database/entity/QuestionResult";
import {gameQuestionResource} from "../../resources/game.question.resource";
import {answerCollectionResource} from "../../resources/answer.collection.resource";
import {answerResource} from "../../resources/answer.resource";

export const fetchQuestion = async function (game: Game, userId) {
    try {
        const gameQuestionRepository = await dataSource.getRepository(GameQuestion);

        const answerRepository = await dataSource.getRepository(Answer)

        const answeredGameQuestions = await dataSource.getRepository(QuestionResult).createQueryBuilder('questionResults')
            .innerJoin('questionResults.gameQuestion', 'gameQuestion')
            .select(['gameQuestion.id'])
            .where('gameQuestion.gameId = :gameId', {gameId: game.id})
            .andWhere("questionResults.userId = :userId", {userId: userId})
            .getRawMany();

        const answeredGameQuestionIds = answeredGameQuestions?.map(result => result.gameQuestion_id);

        const fetchedGameQuestion = await gameQuestionRepository.createQueryBuilder("gameQuestions")
            .where("gameQuestions.gameId = :gameId", {gameId: game.id})
            .andWhere('gameQuestions.id NOT IN (:ids)', {ids: [...answeredGameQuestionIds]})
            .getOne()

        if (fetchedGameQuestion) {
            const correctAnswer = answerResource(await answerRepository.createQueryBuilder("answers")
                .andWhere('answers.questionId = :questionId', {questionId: fetchedGameQuestion.id})
                .where("answers.is_correct = 1")
                .getOne());
            const wrongAnswers = answerCollectionResource(await answerRepository.createQueryBuilder("answers")
                .andWhere('answers.questionId = :questionId', {questionId: fetchedGameQuestion.id})
                .where("answers.is_correct = 0")
                .take(3)
                .getMany());

            return {
                question: gameQuestionResource(fetchedGameQuestion),
                answers: {
                    wrongAnswers,
                    correctAnswer
                }
            }
        }

        return null;

    } catch (error) {
        console.log(error)
        throw error
    }
}


