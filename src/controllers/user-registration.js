
var typeorm = require("typeorm");
var {dataSource} = require('../data-source')

async function registerUser(username , passwd){
  try {
      var newuser = {
        username : username,
        password: passwd
      }
      var userRepository = dataSource.getRepository("user")
      userRepository
          .save(newuser)
          .then(function (savedUsers) {
              console.log("Post has been saved: ", savedUsers)
              console.log("Now lets load all posts: ")
              return userRepository.find()
          })
          .then(function (allPosts) {
              console.log("All posts: ", allPosts)
              // dataSource.close()
          })  
          .catch(function (error) {
        console.log("Error: ", error)
  })
  } catch (err) {
    console.log(err);
  }
 
}

module.exports = {
    registerUser
}