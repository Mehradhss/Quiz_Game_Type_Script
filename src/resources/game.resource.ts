import {Game} from "../../database/entity/Game";
import {gameSessionResource} from "./game.session.resource";
import {userResource} from "./user.resource";

export const gameResource = (game: Game) => {
    return {
        id: game.id,
        status: game.status,
        session: game.session ? gameSessionResource(game.session) : null,
        winner: game.winner ? userResource(game.winner) : null
    }
}