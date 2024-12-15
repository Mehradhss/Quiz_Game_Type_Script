import asyncHandler from "express-async-handler";
import * as express from "express";
import {dataSource} from "../../../../database/DataSource";
import {User} from "../../../../database/entity/User";
import {leaderboardResource} from "../../../resources/leaderboard.resource";

export class LeaderboardController {
    invoke = asyncHandler(async (req: express.Request, res: express.Response) => {
        const leaderboardUsers = await dataSource.getRepository(User)
            .createQueryBuilder("users")
            .orderBy("users.total_points", "DESC")
            .limit(5)
            .getMany();

        res.status(200).json({
            data: {
                users: leaderboardResource(leaderboardUsers)
            }
        })
    })
}