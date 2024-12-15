import {Answer} from "../../database/entity/Answer";

export const answerResource = (answer: Answer) => {
    return {
        id: answer.id,
        text: answer.text,
        title: answer.title,
    }
}