import asyncWrapper from "../../middleware/wrappers/async.wrapper";
import {QuestionResult} from "../../../database/entity/QuestionResult";
import {dataSource} from "../../../database/DataSource";
import {GameQuestion} from "../../../database/entity/GameQuestion";
import {Answer} from "../../../database/entity/Answer";
import {User} from "../../../database/entity/User";

export const submitAnswer = asyncWrapper(async (user: User, answer: any) => {
    const newQuestionResult = new QuestionResult()

    const gameQuestion = newQuestionResult.gameQuestion = await dataSource.getRepository(GameQuestion).findOneOrFail({
        where: {
            id: answer?.gameQuestionId
        }
    });

    const foundAnswer = newQuestionResult.answer = await dataSource.getRepository(Answer).findOneOrFail({
        where: {
            id: answer?.id
        }
    });

    newQuestionResult.user = user;
    newQuestionResult.gameQuestion = gameQuestion
    newQuestionResult.answer = foundAnswer

    await dataSource.manager.save(newQuestionResult);
})