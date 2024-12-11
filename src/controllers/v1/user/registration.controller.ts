import register from "../../../services/Auth/registration.service";
import createToken from "../../../services/Token/token.service";
import asyncHandler from "express-async-handler";
import {User} from "../../../../database/entity/User";

type RequestUser = {
    username : string,
    password : string
}
export class RegistrationController {
    register = asyncHandler(async (req, res) => {
        try {
            const body = {...req.body}

            const user : any = await register(body.username, body.password)

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
}
