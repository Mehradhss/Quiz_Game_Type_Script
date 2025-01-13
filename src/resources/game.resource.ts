import {Game} from "../../database/entity/Game";
import {gameSessionResource} from "./game.session.resource";
import {userResource} from "./user.resource";
import {categoryResource} from "./category.resource";

export const gameResource = (game: Game) => {
    return {
        id: game.id,
        status: game.status,
        difficulty: game.difficulty ?? 1,
        category: game.category ? categoryResource(game.category) : null,
        session: game.session ? gameSessionResource(game.session) : null,
        winner: game.winner ? userResource(game.winner) : null
    }
}