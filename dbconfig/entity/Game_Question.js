module.exports = {
    name: "game_question",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        game_id: {
            type: "int"
        },
        question_id: {
            unique: true,
            type: "int",
            nullable: true,
            primary : false
        }
    },
    relations: {
        questions: {
            target: "question",
            type: "many-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'game_questions',
            joinColumn: {
                name: "question_id",
                referencedColumnName: 'id'
            }
        },
            game: {
                target: "game",
                type: "many-to-one",
                // joinTable: true,
                inverseSide: 'game_questions',
                joinColumn: {
                    name: 'game_id',
                    referencedColumnName: 'id'
                }
            }
        }
    }
