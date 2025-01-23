import {Question} from "../../database/entity/Question";

export const questionCollectionResource = (questions: Question[]) => {
    return questions.map(question => {
        return {
            id: question.id,
            text: question.text,
            category: question.category ?? null
        }
    })
}