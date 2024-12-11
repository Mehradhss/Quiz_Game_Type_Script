import express from "express";
import {LoginController} from "../controllers/v1/user/login.controller";
import {RegistrationController} from "../controllers/v1/user/registration.controller"


const router = express.Router()

const loginController = new LoginController()

const registrationController = new RegistrationController()

router.post('/api/v1/user/registration', registrationController.register)

router.post('/api/v1/user/login', loginController.login)

export {
    router
}
