import {Game} from "../../../database/entity/Game";
import {dataSource} from "../../../database/DataSource";
import {Question} from "../../../database/entity/Question";
import {GameQuestion} from "../../../database/entity/GameQuestion";
import {GameSession} from "../../../database/entity/GameSession";
import {EntityManager} from "typeorm";
import {getRedisClient} from "../../RedisConfig/RedisConfig";

export const startGame = async function (game: Game, status: string) {
    const redisClient = getRedisClient()

    const gameQuestionRepository = await dataSource.getRepository(GameQuestion);

    const fetchedQuestions = await dataSource.getRepository(Question).createQueryBuilder('questions')
        .where("questions.categoryId = :categoryId", {categoryId: game.category?.id})
        .take(10)
        .getMany();

    await fetchedQuestions.forEach(async (question: Question) => {
        const gameQuestion = new GameQuestion();
        gameQuestion.game = game;
        gameQuestion.question = question;
        gameQuestion.questionText = question.text;
        await gameQuestionRepository.save(gameQuestion);
    })

    game.status = status;

    const gameSession = new GameSession();

    gameSession.game = game;

    await dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
        try {
            await transactionalEntityManager.save(game);
            await transactionalEntityManager.save(gameSession);
        }catch (e) {
            throw e
        }
    })

    redisClient.set(`started.${game.id}`, game.id, "EX", (fetchedQuestions.length * 30) + 5)

    return game;
};