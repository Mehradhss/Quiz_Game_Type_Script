import express from "express";
import {UserController} from "../controllers/v1/user/user.controller";
import {CategoryController} from "../controllers/category/category.controller";

const router = express.Router()

const userController = new UserController()

const categoryController = new CategoryController()

router.post('/api/v1/user/registration', userController.register)

router.post('/api/v1/user/login', userController.login)

router.get('/api/v1/category/', categoryController.index)

export {
    router
}
