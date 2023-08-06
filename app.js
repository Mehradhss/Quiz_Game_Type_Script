const express = require('express')
const authRoute = require('./src/routes/authRoutes')
const {app : app} = require('./src/server')
const {server:server} = require('./src/server')
const {createSocketConnection: createSocketConnection} = require('./src/controllers/v1/game_server/Connection')


app.use(express.json())


app.use(express.urlencoded({extended: false}))


// app.use(cors())


app.use(authRoute)

app.all('*', (req, res) => {
    res.status(404).send('URL not found')
})


server.listen(3000, '0.0.0.0', () => {
    console.log("app is listening on port 3000 ...")
    createSocketConnection(server)
})
