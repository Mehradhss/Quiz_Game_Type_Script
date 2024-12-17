import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {QuestionResult} from "../../../database/entity/QuestionResult";
import {User} from "../../../database/entity/User";

export const endGame = async (game: Game, finishStatus: string) => {
    try {
        let winner: User = game.users[0];

        let winnerPoints = 0

        await game.users.forEach(async (user) => {
            const userPoints = await dataSource.getRepository(QuestionResult)
                .createQueryBuilder('questionResults')
                .leftJoin('questionResults.answer', 'answer')
                .leftJoin('questionResults.gameQuestion' , 'gameQuestion')
                .where("questionResults.userId = :userId", {userId: user.id})
                .andWhere("gameQuestion.gameId = :gameId", {gameId: game.id})
                .andWhere("answer.is_correct = :isCorrect", {isCorrect: true})
                .getCount();

            user.total_points += userPoints

            await dataSource.manager.save(user)

            if (userPoints > winnerPoints) {
                winner = user
                winnerPoints = userPoints
            }
        })

        game.status = finishStatus;
        game.winner = winner;

        await dataSource.manager.save(game)

    }catch (e) {
        throw e
    }
}