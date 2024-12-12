import {expressjwt} from "express-jwt";
import {config} from "dotenv";

config()
export const expressAuthMiddleware =
    expressjwt({
        secret: process.env.ACCESS_TOKEN_SECRET ?? "Access_Token_Secret",
        algorithms: ['HS256'],
        getToken: req => req.headers.authorization?.split('|')[1]
    }).unless({
        path: ["/api/v1/user/login", "/api/v1/user/registration"], // Define public routes that don't require authentication
    });
