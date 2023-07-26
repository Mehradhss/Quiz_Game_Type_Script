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
            unique: false,
            type: "int"
        },
        guest_id: {
            unique: false,
            type: "int",
            nullable: true
        },
        createdAt: {
            name: 'created_at',
            type: 'datetime',
            createDate: true,
            nullable: true,
            unique: false
        },
        status: {
            type: "varchar"
        },
        finishedAt: {
            name: 'finished_at',
            type: 'datetime',
            nullable: true
        },
        game_winner_id: {
            type: "int",
            nullable: true
        }
    },
    relations: {

        players: {
            target: 'user',
            type: 'many-to-many',
            inverseSide: 'games'
        },
        // host: {
        //     target: "user",
        //     type: "one-to-one",
        //     // joinTable: true,
        //     // eager: true,
        //     inverseSide: 'game_host',
        //     joinColumn: {
        //         name: 'host_id',
        //         referencedColumnName: 'id'
        //     }
        // },
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

        questions: {
            target: 'question',
            type: 'many-to-many',
            inverseSide: 'games',
            cascade: true,
            joinTable: true
        },
        answers: {
            target: 'game_answer',
            type: 'one-to-many',
            inverseSide: 'games',
            joinColumn: {
                name: 'id',
                referencedColumnName: 'game_id'
            }
        }
    }
}