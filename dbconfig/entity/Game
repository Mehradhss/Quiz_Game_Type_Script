module.exports = {
    name: "game",
    columns: {
        game_primary_id: {
            primary: true,
            type: "int",
            generated: true
        },
        host_id: {
            unique: true,
            type: "int"
        },
        guest_id: {
            unique: true,
            type: "int"
        },
        createdAt: {
            name: 'created_at',
            type: 'datetime',
            createDate: true
        },
        status: {
            type: "varchar"
        },
        finishedAt: {
            name: 'finished_at',
            type: 'datetime'
        },
        game_winner_id: {
            type: "int"
        }
    },
    relations: {
        game_questions: {
            target: "game_question",
            type: "one-to-many",
            // joinTable: true,
            eager: true,
            inverseSide: 'game',
            joinColumn: {
                name: 'game_primary_id',
                referencedColumnName: 'game_id'
            }
        },
        host: {
            target: "user",
            type: "one-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'game_host',
            joinColumn: {
                name: 'host_id',
                referencedColumnName: 'player_id'
            }
        },
        guest: {
            target: "user",
            type: "one-to-one",
            // joinTable: true,
            // eager: true,
            inverseSide: 'game_guest',
            joinColumn: {
                name: 'guest_id',
                referencedColumnName: 'player_id'
            }
        }
    }
};