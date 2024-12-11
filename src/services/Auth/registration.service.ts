const {dataSource} = require('../../../database/DataSource')

export default async function register(username, password) {
    return new Promise(async (resolve, reject) => {
        const userRepository = dataSource.getRepository("user")

        const user = {
            username: username,
            password: password
        }

        await userRepository
            .save(user)
            .then(function (user) {
                resolve(user)
            }).catch(function (error) {
                console.log("[Registration service] Error occurred" + error);
                reject(error)
            })

    })
}
