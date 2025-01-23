import {Category} from "../../database/entity/Category";
import {questionCollectionResource} from "./question.collection.resource";

export const categoryResource = (category: Category) => {
    return {
        id: category.id,
        title: category.title,
        questions: category.questions ? questionCollectionResource(category.questions) : null
    }
}