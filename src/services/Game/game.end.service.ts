import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {QuestionResult} from "../../../database/entity/QuestionResult";
import {User} from "../../../database/entity/User";

export const endGame = async (game: Game, finishStatus: string) => {
    let winner: User;

    let winnerPoints = 0

    await game.users.forEach(async (user) => {
        const userPoints = await dataSource.getRepository(QuestionResult)
            .createQueryBuilder('questionResults')
            .leftJoin('questionResults.answer', 'answer')
            .where("questionResults.userId = :userId" , {userId : user.id})
            .andWhere("questionResults.gameId = :gameId" , {gameId : game.id})
            .andWhere("answer.is_correct = :isCorrect" , {isCorrect : true})
            .getCount();

        user.total_points += userPoints

        if (userPoints > winnerPoints) {
            winner = user
            winnerPoints = userPoints
        }
    })

    game.status = finishStatus;
    game.winner = winner;

    await dataSource.manager.save(game)
}