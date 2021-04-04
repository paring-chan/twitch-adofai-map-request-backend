import mongoose, {Document} from "mongoose";

export interface IChannel extends Document {
    id: string
    activeMap: string
}

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    activeMap: {
        type: String,
    },
})

const Request = mongoose.model<IChannel>('channel', schema)

export default Request
