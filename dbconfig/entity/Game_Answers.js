module.exports = {
    name: "game_answer",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        game_id: {
           type: 'int' ,
            unique: false
        } ,
        game_question_id: {
            type: "int",
            unique: 'true'
        },
        received_answer_id: {
            nullable: true,
            type: "int"
        },
        player_id: {
            unique: true,
            type: "int",
            nullable: true
        }
    },
    relations: {
        // game_questions: {
        //     target: "game_question",
        //     type: "many-to-one",
        //     // joinTable: true,
        //     joinColumn: {
        //         name: 'game_question_id',
        //         referencedColumnName: 'id'
        //     }
        // },
        user_answers: {
            target: "user",
            type: "many-to-one",
            // joinTable: true,
            // eager: true,
            joinColumn: {
                name: 'player_id',
                referencedColumnName: 'id'
            }
        },
        games: {
            target: 'game',
            type: 'many-to-one',
            inverseSide: 'answers',
            cascade:true,
            joinColumn: {
                name: 'game_id',
                referencedColumnName: 'id'
            }
        },
        question: {
            target: 'question',
            // type:"one-to-many",
            inverseSide: 'game_answer',
            joinColumn: {
                name: 'game_question_id',
                referencedColumnName: 'id'
            }
        }
    }
};