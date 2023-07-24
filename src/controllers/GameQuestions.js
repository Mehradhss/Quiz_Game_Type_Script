const {dataSource} = require('../../dbconfig/data-source')
const {game_question} = require('../../dbconfig/entity/Game_Question')

async function shuffle(array){
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}


async function getGameQuestions(game_id , category_id) {
    const questionRepository = await dataSource.getRepository("question");
    const gameQuestionRepository = await dataSource.getRepository("game_question");
    const categoryQuestions = await questionRepository.find({ where: { category_id } });

    if (categoryQuestions.length === 0) {
        console.log(`No questions found for categoryId = ${category_id}`);
        return [];
    }

    const shuffledQuestions = await shuffle(categoryQuestions)

    const randomQuestions = await shuffledQuestions.slice(0, 4);
    console.log(randomQuestions)
    await randomQuestions.forEach(async  (question) => {
        // const gameQuestion = new game_question()
        const gameQuestion = {
            game_id : game_id,
            question_id : question.id
        }
        // gameQuestion.game_id = game_id
        // gameQuestion.question_id = question.id
        await gameQuestionRepository.save(gameQuestion)
    })//.then(console.log("saved successfully"))
    return randomQuestions;
}

async function getGameQuestionsNewer(game_id , category_id) {
    const questionRepository = await dataSource.getRepository("question")
    // const gameQuestionRepository = await dataSource.getRepository("game_question");
    const categoryQuestions = await questionRepository.find({ where: { category_id } })
    const gameRepository =await dataSource.getRepository('game')

    if (categoryQuestions.length === 0) {
        console.log(`No questions found for categoryId = ${category_id}`);
        return [];
    }
    try {
        foundGame = await gameRepository.findOneOrFail({where: {id : game_id} ,relations : ['questions']})
    }catch(error){
        console.log(error)
    }

    const shuffledQuestions = await shuffle(categoryQuestions)

    const randomQuestions = await shuffledQuestions.slice(0, 4);
    console.log(randomQuestions)
    while (foundGame.questions.length > 0 ) {
        foundGame.questions.pop()
    }
    console.log(foundGame)

    await randomQuestions.forEach(async  (question) => {
        // const gameQuestion = new game_question()
        const gameQuestion = {
            game_id : game_id,
            question_id : question.id
        }
        foundGame.questions.push(question)
        // gameQuestion.game_id = game_id
        // gameQuestion.question_id = question.id
        // await gameQuestionRepository.save(gameQuestion)
    })
    await gameRepository.save(foundGame)//.then(console.log(`Game After : ${foundGame.questions[0].jsonString}`))
    //.then(console.log("saved successfully"))
    // return randomQuestions;
    console.log(foundGame)
    bluhbluh(game_id)
}
async function bluhbluh (game_id){
    const gameRepository =await dataSource.getRepository('game')
    const gameWithReadings = await gameRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.questions', 'question')
        .where("game.id LIKE :GameId", { GameId: `%${game_id}%`})
        // .andWhere('question.id = :questionId', { questionId })
        .getOne().then((fetched) => {
            console.log(`fetched is : ${fetched}`)
        })
}

module.exports = {
    getGameQuestions,
    getGameQuestionsNewer
}