module.exports = {
    name: "question",
    columns: {
        question_primary_id: {
            primary: true,
            type: "int",
            generated: true
        },
        question_test: {
            unique: true,
            type: "varchar"
        },
        question_related_category_id: {
            unique: true,
            type: "int"
        }
    },
    relations: {
        answers: {
            target: "answer",
            type: "one-to-many",
            // joinTable: true,
            eager: true,
            inverseSide: 'question',
            joinColumn: {
                name: 'question_primary_id',
                referencedColumnName: 'related_question_id'
            }
        },
        category: {
            target: "category",
            type: "many-to-one",
            inverseSide: 'questions',
            // joinTable: true,
            joinColumn: {
                name: 'question_related_category_id',
                referencedColumnName: 'category_id'
            }
        },
        game_questions: {
            target: "game_question",
            type: "many-to-one",
            // joinTable: true,
            inverseSide: 'questions',
            joinColumn: {
                name: 'question_primary_id',
                referencedColumnName: 'question_id'
            }
        }
    }
};