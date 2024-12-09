module.exports = {
    name: "question",
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
        category_id: {
            // unique: true,
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
                name: 'id',
                referencedColumnName: 'id'
            }
        },
        category: {
            target: "category",
            type: "many-to-one",
            inverseSide: 'questions',
            // joinTable: true,
            joinColumn: {
                name: 'category_id',
                referencedColumnName: 'id'
            }
        },
        games : {
            target : 'game',
            type : 'many-to-many',
            inverseSide: 'questions'
        } ,
    }
}