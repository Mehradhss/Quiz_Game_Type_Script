var EntitySchema = require("typeorm").EntitySchema

module.exports = {
    name: "answer",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        text: {
            unique: true,
            type: "varchar"
        },
        question_id: {
            type: "int"
        },
        is_correct: {
            type :"bit"
        }
    },
    relations: {
        question :{
            target: "question",
            type: "many-to-one",
            inverseSide: 'answers',
            // joinTable: true,
            joinColumn: {
                name: 'question_id',
                referencedColumnName: 'id'
            }
        }
    }
};