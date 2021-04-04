import express from 'express'
// @ts-ignore
import config from '../config.json'
import {loaders, verifyAndDecodeToken} from "./utils";
import mongoose from 'mongoose'
import Request from "./models/Request";
import * as yup from 'yup'
import cors from 'cors'
import http from 'http'
import {Server as SocketIOServer} from "socket.io";
import axios from "axios";
import Channel from "./models/Channel";

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

axios.defaults.headers['Client-ID'] = config.clientID
axios.defaults.headers.Accept = 'application/vnd.twitchtv.v5+json'

const secret = Buffer.from(config.secretKey, 'base64')

const app = express()

const server = http.createServer(app)

app.use(cors())

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
}) as SocketIOServer

app.use(express.json())

app.use(async (req, res, next) => {
    if (req.path.startsWith('/socket.io')) return next()
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
    if (!req.user) return reject()
    let channel = await Channel.findOne({
        id: req.user.channel_id
    })
    if (!channel) {
        channel = new Channel()
        channel.id = req.user.channel_
        await channel.save()
    }
    next()
})

app.get('/requests', async (req, res) => {
    const user = req.user
    const {channel_id} = user
    const list = await Request.find({
        channel: channel_id
    })
    for (const item of list) {
        const requester = await loaders.twitch.users.load(item.requester)
        item.requester = requester.display_name || requester.name
    }
    res.json(list)
})

app.get('/current', async (req, res) => {
    const user = req.user
    const {channel_id} = user

    const channel = await Channel.findOne({
        id: channel_id
    })

    if (!channel) return

    if (!channel.activeMap) {
        return null
    }

    const item = await Request.findOne({
        channel: channel_id,
        _id: channel.activeMap
    })
    const requester = await loaders.twitch.users.load(item!.requester)
    item!.requester = requester.display_name || requester.name
    res.json(item)
})

app.post('/request', async (req, res) => {
    const {channel_id, user_id} = req.user

    const validator = yup.object().shape({
        title: yup.string().required(),
        link: yup.string().url().required(),
        forumLevel: yup.number().min(1).max(20)
    })

    let data

    try {
        data = await validator.validate(req.body)
    } catch (error) {
        return res.status(400).json({error})
    }

    const request = new Request()

    request.channel = channel_id
    request.requester = user_id
    request.title = data.title
    request.link = data.link
    request.lvl = data.forumLevel || undefined

    await request.save()

    console.log(`Created request on channel ${channel_id} by ${user_id}: `, data)

    io.to(channel_id).emit('reload')

    res.json({ok: true})
})

io.use(async (socket, next) => {
    const reject = () => socket.disconnect(true)
    if (!socket.handshake.query.auth) return reject()
    const auth = socket.handshake.query.auth as string
    const user = await verifyAndDecodeToken(auth, secret)
    if (!user) return reject()
    socket.user = user
    next()
})

io.on('connection', (socket) => {
    console.log(`Connected new socket: ${socket.id}`)
    socket.join(socket.user.channel_id)
})

mongoose.connect(config.databaseURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    server.listen(config.port, () => console.log(`Listening on port ${config.port}`))
})

// typings
declare global {
    namespace Express {
        interface Request {
            user: any
        }
    }
}

declare module 'socket.io' {
    interface Socket {
        user: any
    }
}
