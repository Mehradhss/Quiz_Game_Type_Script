var EntitySchema = require("typeorm").EntitySchema

module.exports = {
    name: "answer",
    columns: {
        answer_id: {
            primary: true,
            type: "int",
            generated: true
        },
        answer_text: {
            unique: true,
            type: "varchar"
        },
        related_question_id: {
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
                name: 'related_question_id',
                referencedColumnName: 'question_primary_id'
            }
        }
    }
};