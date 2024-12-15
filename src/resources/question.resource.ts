import {Question} from "../../database/entity/Question";

export const questionResource = (question: Question) => {
    return {
        id: question.id,
        text: question.text,
        category: question.category ?? null
    }
}