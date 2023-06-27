"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const GetAuthRouter_1 = __importDefault(require("./routes/AuthRouter/GetAuthRouter"));
const GetCardsRouter_1 = __importDefault(require("./routes/CardsRouter/GetCardsRouter"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
let jsonBodyMiddleware = express_1.default.json();
exports.app.use((0, cors_1.default)({
    origin: process.env.FRONT_URL,
    credentials: true,
}));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(body_parser_1.default.urlencoded({
    extended: true
}));
exports.app.use(jsonBodyMiddleware);
exports.app.set('trust proxy', 1);
const AuthRouter = (0, GetAuthRouter_1.default)();
const CardsRouter = (0, GetCardsRouter_1.default)();
exports.app.use('/auth', AuthRouter);
exports.app.use('/cards', CardsRouter);
