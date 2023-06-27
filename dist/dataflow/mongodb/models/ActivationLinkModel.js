"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActivationLink = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true }
});
exports.default = (0, mongoose_1.model)('activation_link', ActivationLink);
