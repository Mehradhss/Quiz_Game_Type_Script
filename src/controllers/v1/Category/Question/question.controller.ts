import * as expressJwt from 'express-jwt'
import express from "express";
import asyncHandler from "express-async-handler";
import {dataSource} from "../../../../../database/DataSource";
import {Category} from "../../../../../database/entity/Category";
import {QuestionService} from "../../../../services/Question/question.service";
import {questionResource} from "../../../../resources/question.resource";
import {validationResult} from "express-validator";
import {Question} from "../../../../../database/entity/Question";
import {questionCollectionResource} from "../../../../resources/question.collection.resource";

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

    show = asyncHandler(async (req: expressJwt.Request, res: express.Response) => {
        try {
            if (!req.auth?.isAdmin) {

                res.status(401).json({
                    data: {
                        message: "not authorized"
                    }
                })
            }

            if (!req.params.questionId) {
                res.status(400).json({
                    data: {
                        message: "questionId is required"
                    }
                })
            }

            const question = await dataSource.getRepository(Question).findOne({
                where: {
                    id: parseInt(req.params.questionId)
                },
                relations: ["answers"]
            });

            if (!question) {
                res.status(404).json({
                    data: {
                        message: "question not found"
                    }
                })
            }

            res.status(200).json({
                data: {
                    question: questionResource(question)
                }
            });
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    })

    index = asyncHandler(async (req: expressJwt.Request, res: express.Response) => {
        try {
            if (!req.auth?.isAdmin) {

                res.status(401).json({
                    data: {
                        message: "not authorized"
                    }
                })
            }

            const body = req.body;

            console.log(body)
            console.log({...req.body})

            const questionsQueryBuilder = await dataSource.getRepository(Question)
                .createQueryBuilder('questions')
                .innerJoinAndSelect('questions.answers', 'answers')

            if (body.categoryId) {
                questionsQueryBuilder.where("questions.categoryId = :categoryId", {categoryId: body.categoryId})
            }

            const questions = await questionsQueryBuilder.getMany();

            res.status(200).json({
                data: {
                    questions: questionCollectionResource(questions)
                }
            });
        } catch (e) {
            res.status(500).send({
                data: {
                    message: e.message
                }
            })
        }
    })
}