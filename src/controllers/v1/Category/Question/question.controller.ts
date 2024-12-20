import * as expressJwt from 'express-jwt'
import express from "express";
import asyncHandler from "express-async-handler";
import {dataSource} from "../../../../../database/DataSource";
import {Category} from "../../../../../database/entity/Category";
import {QuestionService} from "../../../../services/Question/question.service";
import {questionResource} from "../../../../resources/question.resource";
import {validationResult} from "express-validator";

export class QuestionController {
    protected questionService;

    constructor() {
        this.questionService = new QuestionService();
    }

    create = asyncHandler(async (req: expressJwt.Request, res: express.Response) => {
        try {
            const result1 = validationResult(req);
            if (!result1.isEmpty()) {
                res.send({errors: result1.array()});
            }

            if (!req.auth?.isAdmin) {

                res.status(401).json({
                    data: {
                        message: "not authorized"
                    }
                })
            }

            const body = {...req.body}
            console.log(body)

            const category = await dataSource.getRepository(Category).findOne({
                where: {
                    id: body.categoryId
                }
            })

            const newQuestion = await this.questionService.create(body, category);

            res.status(201).json({
                data: {
                    question: questionResource(newQuestion)
                }
            });
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
})
}