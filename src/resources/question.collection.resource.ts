import {Question} from "../../database/entity/Question";
import {categoryResource} from "./category.resource";
import {answerCollectionResource} from "./answer.collection.resource";

export const questionCollectionResource = (questions: Question[]) => {
    return questions.map(question => {
        return {
            id: question.id,
            text: question.text,
            category: question.category ? categoryResource(question.category) : null,
            answers: question.answers ? answerCollectionResource(question.answers) : null
        }
    })
}