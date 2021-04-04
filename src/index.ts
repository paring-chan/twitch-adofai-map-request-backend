import express from 'express'
// @ts-ignore
import config from '../config.json'

const app = express()

app.listen(config.port, () => console.log(`Listening on port ${config.port}`))
