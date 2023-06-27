"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRestoreLink = exports.sendActivationLink = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let transporter = nodemailer_1.default.createTransport({
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
const sendActivationLink = (to, link) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта на' + process.env.BACKEND_URL,
        text: '',
        html: `
            <div>
                <h1>Для активации перейдите по ссылке</h1>
                <a href='${link}'>${link}</a>
            </div>
            `
    });
});
exports.sendActivationLink = sendActivationLink;
const sendRestoreLink = (to, link) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Сброс пароля на ' + process.env.FRONT_URL,
        text: '',
        html: `
            <div>
                <h1>Для сброса пароля перейдите по ссылке</h1>
                <a href='${link}'>${link}</a>
            </div>
            `
    });
});
exports.sendRestoreLink = sendRestoreLink;
