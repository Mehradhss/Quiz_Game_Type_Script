import {Game} from "../../database/entity/Game";
import {gameResource} from "./game.resource";

export const gameCollectionResource = (games: Game[]) => {
    return games.map((game) => {
        return gameResource(game)
    })
}