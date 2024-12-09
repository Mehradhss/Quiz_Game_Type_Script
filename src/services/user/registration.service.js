const {dataSource} = require('../../../database/data-source')

module.exports = function register(username,password) {
    const userRepository = dataSource.getRepository("user")

    const user = {
        username: username,
        password: password
    }

    return userRepository
        .save(user)
        .then(function (user)  {
            return user
        }).catch(function (error) {
            console.log("[Registration service] Error occurred"+error);
            throw error;
        })
}
