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
            unique: false
        },
        received_answer_id: {
            nullable: true,
            type: "int"
        },
        player_id: {
            nullable: true,
            // unique: true,
            type: "int",

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
        questions: {
            target: 'question',
            type:"many-to-many",
            inverseSide: 'game_answers',
            cascade: true,
            joinTable : true
            // joinColumn: {
            //     name: 'game_question_id',
            //     referencedColumnName: 'id'
            // }
        }
    }
};