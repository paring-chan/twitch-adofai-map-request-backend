import jwt from 'jsonwebtoken'
import DataLoader from "dataloader";
import axios from "axios";
import {NextFunction, Request, Response} from "express";

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

export function moderatorOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user.role === 'broadcaster' || req.user.role === 'moderator') return next()
    res.status(401).json({
        error: 'You do not have permission to access this resource.'
    })
}

