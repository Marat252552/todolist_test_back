import { Schema, model } from "mongoose";

const returnExpiresInDate = () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() + 30)
    return date
}

const RestoreLink = new Schema({
    email: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    expiresIn: { type: Date, default: returnExpiresInDate }
})

export default model('restore_link', RestoreLink)