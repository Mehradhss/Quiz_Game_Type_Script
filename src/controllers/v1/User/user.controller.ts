import register from "../../../services/Auth/registration.service";
import createToken from "../../../services/Token/token.service";
import loginService from "../../../services/Auth/login.service";
import asyncHandler from "express-async-handler";
import * as express from "express";
import jwt from "jsonwebtoken";
import {dataSource} from "../../../../database/DataSource";
import {User} from "../../../../database/entity/User";
import {userResource} from "../../../resources/user.resource";

export class UserController {
    register = asyncHandler(async (req, res) => {
        try {
            const body = {...req.body}

            const userExists = await dataSource.getRepository(User).findOne({
                where: {
                    username: body.username
                }
            });

            if (userExists) {
                res.status(422).json({message: "username exists!"})

                return
            }

            const user: any = await register(body.username, body.password);

            const accessToken = createToken(user.id, "access", user.isAdmin);
            const refreshToken = createToken(user.id, "refresh", user.isAdmin);

            const response = {
                username: user.username,
                userId: user.id,
                token: accessToken
            }
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "none",
                secure: true
            });

            res.json(response);
        } catch (error) {
            res.status(500).send()
            console.log(error)
        }
    });

    login = asyncHandler(async (req: express.Request, res: express.Response) => {
        try {
            const body = {...req.body}

            const loginData = await loginService(req, res, body.username, body.password)

            res.cookie('jwt', loginData.refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "none",
                secure: true
            });

            res.json({
                userId: loginData.userId,
                token: loginData.accessToken
            }).status(200)
        } catch (error) {
            console.log('error getting request body' + error)

            res.status(408).send()
        }
    });

    refresh = asyncHandler(async (req: express.Request, res: express.Response) => {
        if (!req.cookies?.jwt) {
            res.status(406).json({message: 'Unauthorized'});
        }

        const refreshToken = req.cookies.jwt;

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
            (err, decoded: any) => {
                if (err) {
                    return res.status(406).json({message: 'Unauthorized'});
                }

                const accessToken = createToken(decoded.userId, "access", decoded.isAdmin);
                res.json({accessToken});
            })
    })

    show = asyncHandler(async (req: express.Request, res: express.Response) => {
        const {userId} = req.params

        const user = await dataSource.getRepository(User).findOneOrFail({
            where: {
                id: parseInt(userId)
            },
            relations: ["gameRooms"]
        });

        res.status(200).json({
            data: {
                user: userResource(user)
            }
        })
    })
}

