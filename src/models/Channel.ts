import mongoose, {Document} from "mongoose";

export interface IChannel extends Document {
    id: string
    activeMap: string|null
}

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    activeMap: {
        type: String,
        default: null
    },
})

const Request = mongoose.model<IChannel>('channel', schema)

export default Request
