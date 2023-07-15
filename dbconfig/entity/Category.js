module.exports = {
    name: "category",
    columns: {
        category_id: {
            primary: true,
            type: "int",
            generated: true
        },
        category_text: {
            unique: true,
            type: "varchar"
        },
    },
    relations: {
        questions: {
            target: "question",
            type: "one-to-many",
            inverseSide: 'category',
            // joinTable: true,
            eager: true,
            cascade: true,
            joinColumn: {
                name: 'category_id',
                referencedColumnName: 'question_related_category_id'
            },
        }
    }
}