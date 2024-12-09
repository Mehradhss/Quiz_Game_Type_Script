import "reflect-metadata";
import {DataSource} from "typeorm";

require('dotenv').config()

const dbDriver = process.env.DB_DRIVER as
    | "mysql"
    | "postgres"
    | "sqlite"
    | "mssql"
    | "oracle"
    | "mongodb";

const dbLogging = process.env.DB_LOGGING === "true";

const dbPort = parseInt(process.env.DB_PORT)

export const dataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: dbPort,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: dbLogging,
    extra: {
        trustServerCertificate: true,
    },
    entities: ["./database/entity/*.ts"],
    migrations: ["./database/migrations/*.ts"]
})

dataSource.initialize().then(
    () => {
        console.log("Connected")
    }
).catch((err: any) => {
    console.log("Connection error is : ", err)
})
// module.exports = {
//     dataSource
// }