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
const UserModel_1 = __importDefault(require("../../dataflow/mongodb/models/UserModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = require("bcrypt");
const ActivationLinkModel_1 = __importDefault(require("../../dataflow/mongodb/models/ActivationLinkModel"));
const uuid_1 = require("uuid");
const MailService_1 = require("../../shared/MailService");
const RestoreLinkModel_1 = __importDefault(require("../../dataflow/mongodb/models/RestoreLinkModel"));
let generateTokens = (payload) => {
    let AccessKey = process.env.JWT_ACCESS_KEY;
    let RefreshKey = process.env.JWT_REFRESH_KEY;
    let AccessToken = jsonwebtoken_1.default.sign(payload, AccessKey, { expiresIn: '30m' });
    let RefreshToken = jsonwebtoken_1.default.sign(payload, RefreshKey, { expiresIn: '30d' });
    return { AccessToken, RefreshToken };
};
class Controller {
    signin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { email, password } = req.body;
                if (!email || !password)
                    return res.status(400).json({ message: 'Заполнены не все поля' });
                if (email.length <= 6 || password.length <= 6)
                    return res.status(400).json({ message: 'Минимальное количество символов пароля и почты 6' });
                if (email.length >= 50 || password.length >= 50)
                    return res.status(400).json({ message: 'Максимальное количество символов пароля и почты 50' });
                email = email.toLowerCase();
                let isLoginTaken = yield UserModel_1.default.exists({ email });
                if (isLoginTaken)
                    return res.status(400).json({ message: 'Логин уже занят' });
                let hashedPassword = (0, bcrypt_1.hashSync)(password, 7);
                let user = yield UserModel_1.default.create({ email, password: hashedPassword });
                if (!user)
                    return res.sendStatus(500);
                let { _id } = user;
                const activation_key = (0, uuid_1.v4)();
                yield ActivationLinkModel_1.default.create({ user_id: _id, key: activation_key });
                const activationLink = process.env.BACKEND_URL + '/auth/activate/' + activation_key;
                (0, MailService_1.sendActivationLink)(email, activationLink);
                res.sendStatus(201);
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { email, password, remember = true } = req.body;
                if (!email || !password)
                    return res.sendStatus(400);
                email = email.toLowerCase();
                let user = yield UserModel_1.default.findOne({ email });
                if (!user)
                    return res.status(400).json({ message: 'Пользователя с таким логином нет' });
                let isPasswordValid = (0, bcrypt_1.compareSync)(password, user.password);
                if (!isPasswordValid)
                    return res.status(400).json({ message: 'Пароль неверный' });
                const isNotActivated = yield ActivationLinkModel_1.default.exists({ user_id: user._id });
                if (isNotActivated)
                    return res.status(400).json({ message: 'Аккаунт не активирован по почте' });
                let { _id } = user;
                let { AccessToken, RefreshToken } = generateTokens({ email, user_id: user._id.toString() });
                let jsonResponse = {
                    user: {
                        user_id: _id,
                        email
                    },
                    AccessToken
                };
                if (remember) {
                    res
                        .status(200)
                        .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true })
                        .json(jsonResponse);
                }
                else {
                    res
                        .status(200)
                        .json(jsonResponse);
                }
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    refresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let OldRefreshToken = req.cookies.refresh_token;
                if (!OldRefreshToken)
                    return res.sendStatus(400);
                let decryptedToken = jsonwebtoken_1.default.verify(OldRefreshToken, process.env.JWT_REFRESH_KEY);
                if (!decryptedToken)
                    return res.sendStatus(400);
                let { email, user_id } = decryptedToken;
                let DoesUserExist = yield UserModel_1.default.exists({ email });
                if (!DoesUserExist) {
                    res.status(400).json({ message: 'Пользователя с таким логином нет' });
                    return;
                }
                let { AccessToken, RefreshToken } = generateTokens({ email, user_id });
                let jsonResponse = {
                    user: { email },
                    AccessToken
                };
                res
                    .status(200)
                    .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                    .json(jsonResponse);
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('refresh_token').status(200).end();
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    isLogged(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.headers.authorization) {
                    return res.sendStatus(403);
                }
                let accessToken = req.headers.authorization.split(' ')[1];
                let token = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_KEY);
                let { email } = token;
                let user = yield UserModel_1.default.findOne({ email });
                if (!user)
                    return res.sendStatus(401);
                let { _id } = user;
                let response = {
                    user: {
                        user_id: _id,
                        email
                    }
                };
                res.status(200).json(response);
            }
            catch (e) {
                console.log(e);
                res.sendStatus(403);
            }
        });
    }
    activate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key } = req.params;
                const DoesLinkExist = yield ActivationLinkModel_1.default.exists({ key });
                if (!DoesLinkExist)
                    return res.status(400).send('Недействительная ссылка');
                const result = yield ActivationLinkModel_1.default.deleteOne({ key });
                console.log(result);
                res.status(200).send('Почта успешно подтверждена');
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    sendRestoreLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { email } = req.body;
                if (!email)
                    return res.sendStatus(400).json({ message: 'Почта не указана' });
                email = email.toLowerCase();
                const DoesUserExist = yield UserModel_1.default.exists({ email });
                if (!DoesUserExist)
                    return res.status(400).json({ message: 'Пользователь с указанной почтой не найден' });
                const AlreadyExistingLink = yield RestoreLinkModel_1.default.findOne({ email });
                if (AlreadyExistingLink && AlreadyExistingLink.expiresIn > new Date())
                    return res.status(400).json({ message: 'Ссылка уже отправлена. Создание новой возможно не ранее чем через 30 минут' });
                const key = (0, uuid_1.v4)();
                const RestoreLink = process.env.FRONT_URL + '/#/new_password/' + key;
                yield RestoreLinkModel_1.default.create({ email, key });
                (0, MailService_1.sendRestoreLink)(email, RestoreLink);
                res.status(200).json({ message: 'Ссылка на восстановление пароля отправлена на указанную почту' });
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    setNewPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, password } = req.body;
                if (!key || !password)
                    return res.status(400).json({ message: 'Заполнены не все поля' });
                const RestoreLink = yield RestoreLinkModel_1.default.findOne({ key });
                if (!RestoreLink)
                    return res.status(400).json({ message: 'Ссылка на восстановление пароля не найдена' });
                const { email } = RestoreLink;
                const user = yield UserModel_1.default.findOne({ email });
                if (!user)
                    return res.status(400).json({ message: 'Пользователь не найден' });
                const ArePasswordsEqual = (0, bcrypt_1.compareSync)(password, user.password);
                if (ArePasswordsEqual)
                    return res.status(400).json({ message: 'Новый пароль должен отличаться от предыдущего' });
                const hashedPassword = (0, bcrypt_1.hashSync)(password, 7);
                yield UserModel_1.default.updateOne({ email }, { password: hashedPassword });
                yield RestoreLinkModel_1.default.deleteOne({ key });
                res.status(200).json({ message: 'Пароль успешно изменен' });
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
}
exports.default = new Controller();
