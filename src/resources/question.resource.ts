import {Question} from "../../database/entity/Question";
import {answerCollectionResource} from "./answer.collection.resource";

export const questionResource = (question: Question) => {
    return {
        id: question.id,
        text: question.text,
        category: question.category ?? null,
        answers: question.answers ? answerCollectionResource(question.answers) : null
    }
}