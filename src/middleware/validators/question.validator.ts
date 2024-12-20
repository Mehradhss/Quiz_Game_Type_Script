import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";

export const questionValidator = async (body: any) => {

    if (!body.categoryId) {
        throw new Error("category is not provided!")
    }

    const category = await dataSource.getRepository(Category).findOne({
        where: {
            id: body.categoryId
        }
    })

    if (!category) {
        throw new Error("category not found")
    }

    if (!body.text) {
        throw new  Error("text is not provided")
    }

    if (!body.answers) {
        throw new Error("answers not found");
    }

    if (body.answers.length < 4) {
        throw new Error("at least 4 answers are required")
    }

    let correctAnswers: number = 0
    let unCorrectAnswers: number = 0
    body.answers.forEach((answer: any) => {
        if (answer.isCorrect) {
            correctAnswers += 1
        } else {
            unCorrectAnswers += 1
        }
    })

    if (correctAnswers < 1) {
        throw new Error("at least 1 correct answer is required")
    }

    if (unCorrectAnswers < 3) {
        throw new Error("at least 3 unCorrect answer is required")
    }
};