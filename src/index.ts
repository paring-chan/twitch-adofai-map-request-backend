import express from 'express'
// @ts-ignore
import config from '../config.json'
import {verifyAndDecodeToken} from "./utils";
import mongoose from 'mongoose'
import Request from "./models/Request";

const secret = Buffer.from(config.secretKey, 'base64')

const app = express()

app.use((req, res, next) => {
    const reject = () => res.status(401).send('Unauthorized')
    if (!req.headers.authorization) return reject()
    const header = req.headers.authorization
    const prefix = 'Bearer '
    if (header.startsWith(prefix)) {
        const token = header.slice(prefix.length)
        const user = verifyAndDecodeToken(token, secret)
        if (!user) return reject()
        req.user = user
    } else {
        return reject()
    }
    next()
})

app.get('/requests', async (req, res) => {
    const user = req.user
    const {channel_id} = user
    res.json(await Request.find({
        channel: channel_id
    }))
})

mongoose.connect(config.databaseURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => app.listen(config.port, () => console.log(`Listening on port ${config.port}`)))

// typings
declare global {
    namespace Express {
        interface Request {
            user: any
        }
    }
}
