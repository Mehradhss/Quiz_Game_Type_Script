
var typeorm = require("typeorm");
var {dataSource} = require('../src/data-source')

async function userregistry(username , passwd){
  try {
    
    
      var newuser = {
        username : username,
        password: passwd
      }
      var userRepository = dataSource.getRepository("user")
      userRepository
          .save(newuser)
          .then(function (savedusers) {
              console.log("Post has been saved: ", savedusers)
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
// }
// else {
//   console.log("error")
// }
  
    
  } catch (error1) {
    
  }
 
}

module.exports = {
  userregistry
}