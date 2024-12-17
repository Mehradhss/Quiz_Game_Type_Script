import jwt from 'jsonwebtoken';

export default function createToken(userId, type, isAdmin) {
    let secretKey;
    let expireTime;

    switch (type) {
        case 'refresh':
            secretKey = process.env.REFRESH_TOKEN_SECRET ?? 'Refresh_Token_Secret'
            expireTime = '7d'
            break

        default:
            secretKey = process.env.ACCESS_TOKEN_SECRET ?? 'Access_Token_Secret'
            expireTime = '120m'
            break
    }

    return jwt.sign({userId: userId, isAdmin: isAdmin}, secretKey, {expiresIn: '120m'})
}