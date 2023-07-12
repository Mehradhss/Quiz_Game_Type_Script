const express = require ('express')
const app = express()
const authRoute  = require ('./routes/authRoutes')
const jwt = require('jsonwebtoken')



app.use(express.json())


app.use(express.urlencoded({ extended: false }))


// app.use(cors())



app.use(authRoute)

app.all('*' , (req , res )=>{
    res.send('URL not found')
})


app.listen(3000 ,'0.0.0.0', ()=> {

    console.log("server is listening on port 3000 ...")
})
