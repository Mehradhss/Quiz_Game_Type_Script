import {Request, Response} from "express";
import createToken from "../Token/token.service";
import {dataSource} from "../../../database/DataSource";
import {config} from "dotenv";

config()

export default async function loginService(req: Request, res: Response, username: any, password: any) {
    if (!(username && password)) {
        res.status(400).send();
    }
    try {
        const userRepository = await dataSource.getRepository("user")

        const foundUser = await userRepository.findOneOrFail({
            where: {
                username,
                password
            }
        })

        const accessToken = createToken(foundUser.id, "access" , foundUser.isAdmin);
        const refreshToken = createToken(foundUser.id, "refresh" , foundUser.isAdmin);

        return {
            refreshToken: refreshToken,
            accessToken: accessToken,
            userId : foundUser.id
        };

    } catch (error) {
        res.status(401).send("username or password incorrect ! ")
        throw error
    }
}

