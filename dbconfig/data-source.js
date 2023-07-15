const typeORM = require("typeorm");
const entitySchema = typeORM.EntitySchema;
require('dotenv').config()

const dataSource = new typeORM.DataSource({
    type: process.env.DB_DRIVER,
    host: "localhost" ,  //process.env["HOST "]
    port: process.env["PORT "],
    username: process.env.USER_NAME , //"mhss",
    password: process.env.PASSWORD,
    database: process.env["DATABASE "],
    synchronize: process.env["SYNCHRONIZE "],
    logging: process.env["LOGGING "],
    extra: {
        trustServerCertificate: true,
    },
    entities: [
        new entitySchema(require("./entity/User"))
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