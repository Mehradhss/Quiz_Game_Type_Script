import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {QuestionResult} from "../../../database/entity/QuestionResult";
import {dataSource} from "../../../database/DataSource";
import {GameQuestion} from "../../../database/entity/GameQuestion";
import {Answer} from "../../../database/entity/Answer";
import {User} from "../../../database/entity/User";

export const submitAnswer = asyncWrapper(async (user: User, answer: any) => {
    const newQuestionResult = new QuestionResult()

    newQuestionResult.gameQuestion = await dataSource.getRepository(GameQuestion).findOneOrFail({
        where: {
            id: answer?.gameQuestionId
        }
    });

    newQuestionResult.answer = await dataSource.getRepository(Answer).findOneOrFail({
        where: {
            id: answer.id
        }
    });

    newQuestionResult.user = user;

    await dataSource.manager.save(newQuestionResult);
})