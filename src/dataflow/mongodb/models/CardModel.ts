import { Schema, model } from "mongoose";


const Card = new Schema({
    user_id: {type: String, required: true},
    value: {type: String, required: true},
    completed: {type: Boolean, default: false}
})

export default model('card', Card)