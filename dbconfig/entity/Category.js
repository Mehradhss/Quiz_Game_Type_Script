module.exports = {
    name: "category",
    columns: {
        id: {
            primary: true,
            type: "int",
            // generated: true,
            nullable: false
        },
        text: {
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
                name: 'id',
                referencedColumnName: 'category_id'
            },
        }
    }
}