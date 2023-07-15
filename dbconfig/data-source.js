const typeORM = require("typeorm");
const entitySchema = typeORM.EntitySchema;
require('dotenv').config()

const dataSource = new typeORM.DataSource({
    type: process.env.DB_DRIVER,
    host: process.env.HOST,
    port: 1433 ,//process.env.PORT,
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: process.env.SYNCHRONIZE,
    logging: process.env.LOGGING,
    extra: {
        trustServerCertificate: true,
    },
    entities: [
        new entitySchema(require("./entity/User")),
        new entitySchema(require("./entity/Game")),
        new entitySchema(require("./entity/Answer")),
        new entitySchema(require("./entity/Category")),
        new entitySchema(require("./entity/Question")),
        new entitySchema(require("./entity/Game_Answers")),
        new entitySchema(require("./entity/Game_Question"))
    ]
})

dataSource.initialize().then(
    () => {
        console.log("Connected")
    }
).catch((err) => {
    console.log("Connection error is : ",err)
})
module.exports = {
    dataSource
}