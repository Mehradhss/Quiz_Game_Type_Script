import express from "express";
import {CategoryController} from "../controllers/v1/Category/category.controller";
import {expressAuthMiddleware} from "../middleware/express.auth.middleware";
import {QuestionController} from "../controllers/v1/Category/Question/question.controller";
import {questionValidator} from "../middleware/validators/question.validator";
import {body} from "express-validator";
import {categoryValidator} from "../middleware/validators/category.validator";

const adminRouter = express.Router()

const categoryController = new CategoryController()

const questionController = new QuestionController()

adminRouter.use(expressAuthMiddleware)

adminRouter.post('/api/v1/category/', body().custom(categoryValidator), categoryController.create)

adminRouter.post('/api/v1/question/', body().custom(questionValidator), questionController.create)

export {
    adminRouter
}