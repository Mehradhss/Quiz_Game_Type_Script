module.exports = {
    name: "user",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            unique: true,
            type: "varchar",
        },
        password: {
            type: "varchar"
        }
    },
    relations: {}
};