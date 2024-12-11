// const asyncHandler = require("express-async-handler")
import login from "../../../services/Auth/login.service";
import * as express from 'express'
import asyncHandler from "express-async-handler";

export class LoginController {
    login = asyncHandler(async (req: express.Request, res: express.Response) => {
        try {
            const body = {...req.body}

            const token = await login(req, res, body.username, body.password)

            res.json({token: token}).status(200)
        } catch (error) {
            console.log('error getting request body' + error)

            res.status(408).send()
        }
    })
}

