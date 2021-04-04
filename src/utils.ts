import jwt from 'jsonwebtoken'
import DataLoader from "dataloader";
import axios from "axios";

export function verifyAndDecodeToken(token: string, secret: Buffer) {
    try {
        return jwt.verify(token, secret, {
            algorithms: ['HS256']
        })
    } catch {
        return
    }
}

export const loaders = {
    twitch: {
        users: new DataLoader<string, any>(keys => Promise.all(keys.map(id=>axios.get(`https://api.twitch.tv/kraken/users/${id}`).then(res=>res.data))))
    }
}
