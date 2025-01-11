import express from "express";
import {UserController} from "../controllers/v1/User/user.controller";
import {CategoryController} from "../controllers/v1/Category/category.controller";
import {LeaderboardController} from "../controllers/v1/LeaderBoard/leaderboard.controller";
import {GameRoomController} from "../controllers/v1/GameRoom/game.room.controller";
import {expressAuthMiddleware} from "../middleware/express.auth.middleware";

const router = express.Router()

const userController = new UserController()

const categoryController = new CategoryController()

const leaderBoardController = new LeaderboardController()

const gameRoomController = new GameRoomController()

router.use(expressAuthMiddleware)

router.post('/api/v1/user/registration', userController.register)

router.post('/api/v1/user/login', userController.login)

router.get('api/v1/user/refresh', userController.refresh)

router.get('/api/v1/category/', categoryController.index)

router.get('/api/v1/leaderboard', leaderBoardController.invoke)

router.get('/api/v1/user/:userId/', userController.show)

router.get('/api/v1/game-room/:gameRoomId/', gameRoomController.show)

router.get('/api/v1/user/:userId/game-history', userController.gameHistory)

export {
    router
}
