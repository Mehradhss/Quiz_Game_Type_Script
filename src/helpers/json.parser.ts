export const jsonParser = (data : any) => {
    try {
        return JSON.parse(data)
    }catch (e) {
        throw e
    }
}