import asyncHandler from "express-async-handler";
import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";

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


}