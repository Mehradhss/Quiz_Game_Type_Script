module.exports = {
    name: "game_answer",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        game_question_id: {
            type: "int"
        },
        received_answer_id: {
            type: "int"
        },
        player_id: {
            unique: true,
            type: "int"
        }
    },
    relations: {
        game_questions: {
            target: "game_question",
            type: "many-to-one",
            // joinTable: true,
            joinColumn: {
                name: 'game_question_id',
                referencedColumnName: 'id'
            }
        },
        user_answers: {
            target: "user",
            type: "many-to-one",
            // joinTable: true,
            // eager: true,
            joinColumn: {
                name: 'player_id',
                referencedColumnName: 'id'
            }
        }
    }
};