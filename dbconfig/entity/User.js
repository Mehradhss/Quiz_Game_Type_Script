module.exports = {
    name: "user",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        username: {
            unique: true,
            type: "varchar",
        },
        password: {
            type: "varchar"
        },
        points: {
            type: "int",
            nullable: true
        }
    },
    relations: {
        games: {
            target: "game",
            type: "many-to-many",
            // joinTable: true,
            // eager: true,
            inverseSide: 'players',
            // joinColumn: {
            //     name: 'id',
            //     referencedColumnName: 'host_id'
            // }
            cascade: true,
            joinTable: true
        },
        game_points : {
            target : 'game_point',
            type : 'many-to-many',
            inverseSide : 'users' ,
            eager : true ,
            cascade : true
        },

        // game_guest: {
        //     target: "game",
        //     type: "one-to-one",
        //     // joinTable: true,
        //     // eager: true,
        //     inverseSide: 'guest',
        //     joinColumn: {
        //         name: 'id',
        //         referencedColumnName: 'guest_id'
        //     }
        // }
    }
};