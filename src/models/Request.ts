import mongoose, {Document} from "mongoose";

export interface IRequest extends Document {
    requester: string
    channel: string
    title: string
    link: string
    lvl?: number
}

const schema = new mongoose.Schema({
    requester: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    lvl: {
        type: Number
    }
})

const Request = mongoose.model<IRequest>('request', schema)

export default Request
