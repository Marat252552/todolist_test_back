"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Card = new mongoose_1.Schema({
    user_id: { type: String, required: true },
    value: { type: String, required: true },
    completed: { type: Boolean, default: false }
});
exports.default = (0, mongoose_1.model)('card', Card);
