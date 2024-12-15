import {GameSession} from "../../database/entity/GameSession";

export const gameSessionResource = (gameSession: GameSession) => {
    return {
        id: gameSession.id,
        created_at: gameSession.created_at,
        updated_at: gameSession.updated_at
    }
}