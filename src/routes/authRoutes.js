const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const {registerUser} = require('../controllers/User-Registration')
const {login} = require('../controllers/User-Login')
const {testingGame} = require('../controllers/test')
const {createSocketConnection: createSocketConnection} = require('../controllers/Connection')
const {getIo: getIo} = require('../controllers/Connection')
const {server} = require('../server')
const {createGame} = require('../controllers/GameCreation')

router.route('/api/v1/verify').get((req, res) => {
    const accessToken = req.headers['authorization'].split('Bearer ')[1];
    console.log(accessToken)
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) res.status(401).json({
            "login": false
        })
        console.log(user)
        res.status(201).json({
            "login": true
        })
    })
})
router.route('/test/sc').get((req, res, next) => {
    try {
        createGame()
    } catch (error) {
        console.log(error)
    }
})
router.route('/api/v1/user/registration').post( (req, res, next) => {
    let body = {...req.body}
    console.log(body.username, body.password)
    try {
        registerUser(req, res, body.username, body.password)
    } catch (error) {
        next(error)
    }
})

router.route('/api/v1/user/login').post((req, res, next) => {
    let body = {...req.body}
    try {
        login(req, res, body.username, body.password)
    } catch (error) {
        res.status(408).send()
        console.log(error)
    }
})
router.route("/test").get((req, res,) => {
    try {
        testingGame()
        res.status(201).json({
            "tested": true
        })
    } catch (err) {
        res.status(400).send()
        console.log(error)
    }
})

module.exports = router
