import asyncHandler from "express-async-handler";
import express from "express";
import {dataSource} from "../../../../database/DataSource";
import {GameRoom} from "../../../../database/entity/GameRoom";
import {gameRoomResource} from "../../../resources/game.room.resource";

export class GameRoomController {
    show = asyncHandler(async (req: express.Request, res: express.Response) => {
        const {gameRoomId} = req.params;

        const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
            where: {
                id: parseInt(gameRoomId)
            },
            relations: ["games", "games.session", 'games.category', "users"]
        });

        res.json({
            data: {
                gameRoom: gameRoomResource(gameRoom)
            }
        })
    })
}