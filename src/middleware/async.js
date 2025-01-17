const asyncWrapper = (func) => {
    return async (req, res, next) => {
        try {
            await func(req, res, next)

        } catch (error) {
            nextr(erro)
        }
    }
}

module.exports = asyncWrapper
