module.exports = {
    name: "game_point",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            nullable: false
        },
        game_id: {
            type: 'int',
            unique: false
        },
        user_id: {
            type: "int",
            unique: 'true'
        },
        points: {
            nullable: true,
            type: "int"
        },


    },
    relations : {
        users : {
            target : 'user',
            type : 'many-to-many',
            inverseSide : 'game_points' ,
            joinTable : true
        },
        game : {
            target : 'game',
            type : 'many-to-one',
            inverseSide : 'game_points' ,
            joinColumn : {
                name: 'game_id',
                referencedColumnName : 'id'
            }
        }
    }
}
