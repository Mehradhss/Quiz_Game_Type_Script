import {Request, Response} from "express";
import createToken from "../Token/token.service";
import {dataSource} from "../../../database/DataSource";
import {config} from "dotenv";

config()

export default async function login(req: Request, res: Response, username: any, password: any) {
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

        return createToken(foundUser);
    } catch (error) {
        res.status(401).send("username or password incorrect ! ")
        throw error
    }
}

