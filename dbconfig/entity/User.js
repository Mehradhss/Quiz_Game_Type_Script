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
        },
        points: {
            type: "int"
        }
    },
    relations: {
        game_host: {
            target: "game",
            type: "one-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'host',
            joinColumn: {
                name: 'id',
                referencedColumnName: 'host_id'
            }
        },
        game_guest: {
            target: "game",
            type: "one-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'guest',
            joinColumn: {
                name: 'id',
                referencedColumnName: 'guest_id'
            }
        }
    }
};