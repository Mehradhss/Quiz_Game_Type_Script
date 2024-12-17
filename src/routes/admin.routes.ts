import express from "express";
import {CategoryController} from "../controllers/v1/Category/category.controller";
import {expressAuthMiddleware} from "../middleware/express.auth.middleware";

const adminRouter = express.Router()

const categoryController = new CategoryController()

adminRouter.use(expressAuthMiddleware)

adminRouter.post('/api/v1/category/', categoryController.create)

export {
    adminRouter
}