import express from "express";
import {UserController} from "../controllers/v1/user/user.controller";

const router = express.Router()

const userController = new UserController()

router.post('/api/v1/user/registration', userController.register)

router.post('/api/v1/user/login', userController.login)

export {
    router
}
