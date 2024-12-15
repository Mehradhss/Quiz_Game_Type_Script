import {Answer} from "../../database/entity/Answer";

export const answerCollectionResource = (answers: Answer[]) => {
    return answers.map((answer) => {
        return {
            id: answer.id,
            text: answer.text,
            title: answer.title,
        }
    })
}