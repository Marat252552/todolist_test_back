import { Schema, model } from "mongoose";


const ActivationLink = new Schema({
    key: {type: String, required: true, unique: true},
    user_id: {type: String, required: true, unique: true}
})

export default model('activation_link', ActivationLink)