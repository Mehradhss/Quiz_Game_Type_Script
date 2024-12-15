import express from "express";
import {UserController} from "../controllers/v1/user/user.controller";
import {CategoryController} from "../controllers/category/category.controller";
import {LeaderboardController} from "../controllers/LeaderBoard/leaderboard.controller";

const router = express.Router()

const userController = new UserController()

const categoryController = new CategoryController()

const leaderBoardController = new LeaderboardController()

router.post('/api/v1/user/registration', userController.register)

router.post('/api/v1/user/login', userController.login)

router.get('api/v1/user/refresh', userController.refresh)

router.get('/api/v1/category/', categoryController.index)

router.get('/api/v1/leaderboard', leaderBoardController.invoke)

router.get('/api/v1/user/:userId/', userController.show)

export {
    router
}
