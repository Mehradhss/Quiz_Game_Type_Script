module.exports = {
    name: "game_question",
    columns: {
        game_question_primary_id: {
            primary: true,
            type: "int",
            generated: true
        },
        game_id: {
            type: "int"
        },
        question_id: {
            unique: true,
            type: "varchar"
        }
    },
    relations: {
        questions: {
            target: "question",
            type: "one-to-many",
            // joinTable: true,
            eager: true,
            inverseSide: 'game_questions',
            joinColumn: {
                name: 'question_id',
                referencedColumnName: 'question_primary_id'
            },
            game: {
                target: "game",
                type: "many-to-one",
                // joinTable: true,
                inverseSide: 'game_questions',
                joinColumn: {
                    name: 'game_id',
                    referencedColumnName: 'game_primary_id'
                }
            }
        }
    }
};