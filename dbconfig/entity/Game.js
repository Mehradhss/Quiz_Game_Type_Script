module.exports = {
    name: "game",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        host_id: {
            unique: true,
            type: "int"
        },
        guest_id: {
            unique: true,
            type: "int",
            nullable: true
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
                name: 'id',
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
                referencedColumnName: 'id'
            }
        },
        // guest: {
        //     target: "user",
        //     type: "one-to-one",
        //     // joinTable: true,
        //     // eager: true,
        //     inverseSide: 'game_guest',
        //     joinColumn: {
        //         name: 'guest_id',
        //         referencedColumnName: 'id'
        //     }
        // }
    }
};