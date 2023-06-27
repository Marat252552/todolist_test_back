"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const returnExpiresInDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return date;
};
const RestoreLink = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    expiresIn: { type: Date, default: returnExpiresInDate }
});
exports.default = (0, mongoose_1.model)('restore_link', RestoreLink);
