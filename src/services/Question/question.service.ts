import {dataSource} from "../../../database/DataSource";
import {Question} from "../../../database/entity/Question";
import {Category} from "../../../database/entity/Category";
import {Answer} from "../../../database/entity/Answer";

export class QuestionService {
    create = async (params: any, category: Category) => {
        const questionRepository = await dataSource.getRepository(Question);

        const newQuestion = new Question();

        newQuestion.text = params.text;

        newQuestion.category = category;

        await questionRepository.save(newQuestion)

        await params.answers?.forEach(async (answer: any) => {
            const newAnswer = new Answer();

            newAnswer.text = answer.text;

            newAnswer.question = newQuestion;

            newAnswer.is_correct = answer.isCorrect;

            await dataSource.manager.save(newAnswer)
        })

        return newQuestion;
    }
}