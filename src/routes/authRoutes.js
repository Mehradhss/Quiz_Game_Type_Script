const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const {userRegistry: registerUser} = require('../controllers/user-registration')
const {login} = require('../controllers/user-login')
const {testingGame} = require ('../controllers/test')
router.route('/api/v1/test').get((req, res) => {
    const accessToken = req.headers['authorization'].split('Bearer ')[1];
    console.log(accessToken)
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) res.status(401).json({
            "login": false
        })
        res.status(201).json({
            "login": true
        })
    })
})
router.route('/api/v1/user/registeration').post((req, res, next) => {
    let body = {...req.body}
    console.log(body.username, body.password)
    try {
        userRegistry(body.username, body.password)
        res.status(201).send("Success ! ")

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
    try{
        testingGame()
        res.status(201).json({
            "tested" : true
        })
    } catch(err){
        res.status(400).send()
        console.log(error)
    }
})

module.exports = router
