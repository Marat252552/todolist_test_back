"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const GenerateTokens = (TokenPayload) => {
    try {
        const AccessKey = process.env.ACCESS_KEY_SECRET;
        const RefreshKey = process.env.REFRESH_KEY_SECRET;
        const AccessToken = jsonwebtoken_1.default.sign(TokenPayload, AccessKey);
        const RefreshToken = jsonwebtoken_1.default.sign(TokenPayload, RefreshKey);
        return { AccessToken, RefreshToken };
    }
    catch (e) {
        console.log(e);
    }
};
exports.default = GenerateTokens;
