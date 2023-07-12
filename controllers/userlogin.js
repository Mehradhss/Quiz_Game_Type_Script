var {dataSource} = require ('../src/data-source')
const jwt  = require ('jsonwebtoken')
require('dotenv').config()

async function login(req , res  , username , password) {
  
    if (!(username && password)) {
      res.status(400).send();
    }   
    var user = {
        username : username,
        password:password
    }
    console.log(user)
    var userRepository = dataSource.getRepository("user")
    var findeduser
  
    try {
      findeduser  = await userRepository.findOneOrFail({ where: { 
        username ,
        password
    } 
});
    } catch (error) {
        res.status(401)
        .send("username or password incorrect ! ")
    }
    console.log(findeduser)
    if (findeduser){ 
        user = {username : findeduser.username}
        const accesstoken = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET)      
        res.status(200)
            // .send("logged in succesfully ! ");
            .json({
                "token" : accesstoken
            })
        return
        

    }
}


module.exports = { 
    login 
}
