const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const registrationController = require("../controllers/v1/user/registration.controller")
const loginController = require('../controllers/v1/user/login.controller')

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
router.post('/api/v1/user/registration', registrationController.register_user)


router.post('/api/v1/user/login', loginController.login_user)



module.exports = router
