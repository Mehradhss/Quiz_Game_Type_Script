
var typeorm = require("typeorm");
var EntitySchema = typeorm.EntitySchema;


var dataSource = new typeorm.DataSource({
    type: "mssql",
    host: "localhost",
    port: 1433 ,
    username: "mhss",
    password: "Mehrad",
    database: "Test",
    synchronize: true,
    logging: false,
    extra: {
        trustServerCertificate: true,
      } , 
    entities: [
        new EntitySchema(require("./entity/User"))
    ]
})

dataSource.initialize().then(
    () =>{
      console.log("conneted")
    }
  ).catch((err) => {
    console.log(error)
  }) 
module.exports = {
  dataSource
}