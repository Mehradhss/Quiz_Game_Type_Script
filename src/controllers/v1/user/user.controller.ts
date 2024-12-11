import register from "../../../services/Auth/registration.service";
import createToken from "../../../services/Token/token.service";
import loginService from "../../../services/Auth/login.service";
import asyncHandler from "express-async-handler";
import * as express from "express";

export class UserController {
    register = asyncHandler(async (req, res) => {
        try {
            const body = {...req.body}

            const user: any = await register(body.username, body.password)

            const token = createToken(user)

            const response = {
                username: user.username,
                token: token
            }

            res.json(response);
        } catch (error) {
            res.status(500).send()
            console.log(error)
        }
    });

    login = asyncHandler(async (req: express.Request, res: express.Response) => {
        try {
            const body = {...req.body}

            const token = await loginService(req, res, body.username, body.password)

            res.json({token: token}).status(200)
        } catch (error) {
            console.log('error getting request body' + error)

            res.status(408).send()
        }
    });
}
