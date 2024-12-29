import asyncHandler from "express-async-handler";
import {dataSource} from "../../../../database/DataSource";
import {Category} from "../../../../database/entity/Category";
import express from "express";
import * as expressJwt from "express-jwt";
import {validationResult} from "express-validator";

export class CategoryController {
    index = asyncHandler(async (req, res) => {
        try {
            const categoryRepository = await dataSource.getRepository(Category);

            const categories = await categoryRepository.find();

            res.status(200).json({
                data: {
                    categories: categories
                }
            })
        } catch (e) {
            res.status(500).json({
                data: {
                    message: e.message
                }
            })

            console.log(e)
        }
    })

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

                const categoryRepository = dataSource.getRepository(Category);

                const category = new Category();
                category.title = body?.title;
                await categoryRepository.save(category)

                res.status(201).json({
                    data: {category: category}
                })

            } catch (e) {
                res.status(500).json({
                    message: "there is an server error please try again!"
                })

                console.log(`category creation error: ${e}`)
            }
        })
}