import {GameQuestion} from "../../database/entity/GameQuestion";

export const gameQuestionResource = (gameQuestion: GameQuestion) => {
    return {
        id: gameQuestion.id,
        text: gameQuestion.questionText,
    }
}