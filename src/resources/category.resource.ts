import {Category} from "../../database/entity/Category";

export const categoryResource = (category: Category) => {
    return {
        id: category.id,
        title: category.title
    }
}