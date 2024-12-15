import {GameQuestion} from "../../database/entity/GameQuestion";

export const gameQuestionResource = async (gameQuestion: GameQuestion) => {
    return {
        id: gameQuestion.id,
        text: gameQuestion.questionText,
    }
}