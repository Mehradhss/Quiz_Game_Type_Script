import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";

export const categoryValidator = async (body: any) => {
    const categoryTitle = body.title;

    if (!categoryTitle) {
        throw new Error("category title is required.");
    }

    const category = await dataSource.getRepository(Category).findOne({
        where : {
            title: categoryTitle
        }
    })

    if (category){
        throw new Error("category title must be unique.");
    }
}