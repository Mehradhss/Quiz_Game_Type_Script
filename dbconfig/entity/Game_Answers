module.exports = {
    name: "game_answer",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        game_question_id: {
            type: "int"
        },
        received_answer_id: {
            type: "int"
        },
        answers_player_id: {
            unique: true,
            type: "int"
        }
    },
    relations: {
        game_questions: {
            target: "game_question",
            type: "one-to-one",
            // joinTable: true,
            inverseSide: 'game_answers',
            joinColumn: {
                name: 'game_question_id',
                referencedColumnName: 'game_question_primary_id'
            }
        },
        user_answers: {
            target: "user",
            type: "many-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'game_answers',
            joinColumn: {
                name: 'answers_player_id',
                referencedColumnName: 'player_id'
            }
        }
    }
};