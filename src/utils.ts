import jwt from 'jsonwebtoken'

export function verifyAndDecodeToken(token: string, secret: Buffer) {
    try {
        return jwt.verify(token, secret, {
            algorithms: ['HS256']
        })
    } catch {
        return
    }
}