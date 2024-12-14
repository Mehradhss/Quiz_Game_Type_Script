import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {Question} from "../../../database/entity/Question";
import {GameQuestion} from "../../../database/entity/GameQuestion";

export const startGame = async function (game: Game, status: string) {
    const gameQuestionRepository = await dataSource.getRepository(GameQuestion);

    const fetchedQuestions = await dataSource.getRepository(Question).createQueryBuilder('questions')
        .where("questions.categoryId = :categoryId", {categoryId: game.category?.id})
        .take(10)
        .getMany();

    fetchedQuestions.forEach((question: Question) => {
        const gameQuestion = new GameQuestion();
        gameQuestion.game = game;
        gameQuestion.question = question;
        gameQuestionRepository.save(gameQuestion);

        game.gameQuestions.push(gameQuestion);
    })

    game.status = status;

    await dataSource.manager.save(game);

    return game;
};