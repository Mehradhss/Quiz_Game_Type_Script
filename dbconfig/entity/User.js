module.exports = {
    name: "user",
    columns: {
        player_id: {
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
                name: 'player_id',
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
                name: 'player_id',
                referencedColumnName: 'guest_id'
            },
            game_answers: {
                target: "user",
                type: "one-to-many",
                // joinTable: true,
                // eager: true,
                inverseSide: 'user_answers',
                joinColumn: {
                    name: 'player_id',
                    referencedColumnName: 'answers_player_id'
                }
            }
        }
    }
};