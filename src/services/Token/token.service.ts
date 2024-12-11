import jwt from 'jsonwebtoken';

export default function createToken(user) {
    const secretKey = process.env.TOKEN_SECRET ?? 'Access_Token_Secret'

    return jwt.sign({userId: user.id}, secretKey, {expiresIn: '60m'})
}