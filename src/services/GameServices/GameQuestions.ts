import {dataSource} from "../../../database/DataSource";
import {getRedisClient} from "../../RedisConfig/RedisConfig";

async function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

export async function getGameQuestions(game_id, category_id) {
    const questionRepository = await dataSource.getRepository("question")

    const categoryQuestions = await questionRepository.find({where: {category_id}})

    const gameRepository = await dataSource.getRepository('game')

    if (categoryQuestions.length === 0) {
        console.log(`No questions found for categoryId = ${category_id}`);
        return [];
    }

    try {
        const foundGame = await gameRepository.findOneOrFail({where: {id: game_id}, relations: ['questions']})

        const shuffledQuestions = await shuffle(categoryQuestions)

        const randomQuestions = await shuffledQuestions.slice(0, 6);

        while (foundGame.questions.length > 0) {
            foundGame.questions.pop()
        }

        await randomQuestions.forEach(async (question) => {
            await foundGame.questions.push(question)
        })

        await gameRepository.save(foundGame)

        return foundGame.questions
    } catch (error) {
        console.log(error)
    }
}