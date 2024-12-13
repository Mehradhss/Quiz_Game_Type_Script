import jwt from 'jsonwebtoken';

export default function createToken(userId, type) {
    let secretKey
    switch (type) {
        case 'refresh':
            secretKey = process.env.REFRESH_TOKEN_SECRET ?? 'Refresh_Token_Secret'
            break

        default:
            secretKey = process.env.ACCESS_TOKEN_SECRET ?? 'Access_Token_Secret'
            break
    }

    return jwt.sign({userId: userId}, secretKey, {expiresIn: '120m'})
}