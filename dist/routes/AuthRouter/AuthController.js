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
            console.log('signin');
            try {
                let { login, password, remember = true } = req.body;
                if (!login || !password)
                    return res.status(400).json({ message: 'Заполнены не все поля' });
                let isLoginTaken = yield UserModel_1.default.exists({ login });
                if (isLoginTaken)
                    return res.status(400).json({ message: 'Логин уже занят' });
                let hashedPassword = (0, bcrypt_1.hashSync)(password, 7);
                let user = yield UserModel_1.default.create({ login, password: hashedPassword });
                if (!user)
                    return res.sendStatus(500);
                let { _id } = user;
                let { AccessToken, RefreshToken } = generateTokens({ login });
                let jsonResponse = {
                    user: {
                        user_id: _id,
                        login
                    },
                    AccessToken
                };
                res.status(201);
                if (remember) {
                    res.cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                        .json(jsonResponse);
                }
                else {
                    res.json(jsonResponse);
                }
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
                let { login, password, remember = true } = req.body;
                if (!login || !password)
                    return res.sendStatus(400);
                let user = yield UserModel_1.default.findOne({ login });
                if (!user)
                    return res.status(400).json({ message: 'Пользователя с таким логином нет' });
                let isPasswordValid = (0, bcrypt_1.compareSync)(password, user.password);
                if (!isPasswordValid)
                    return res.status(400).json({ message: 'Пароль неверный' });
                let { _id } = user;
                let { AccessToken, RefreshToken } = generateTokens({ login });
                let jsonResponse = {
                    user: {
                        user_id: _id,
                        login
                    },
                    AccessToken
                };
                res
                    .status(200)
                    .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                    .json(jsonResponse);
                // if (remember) {
                //     res
                //         .status(200)
                //         .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                //         .json(jsonResponse)
                // } else {
                //     res
                //         .status(200)
                //         .json(jsonResponse)
                // }
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
                let { login } = decryptedToken;
                let DoesUserExist = yield UserModel_1.default.exists({ login });
                if (!DoesUserExist) {
                    res.status(400).json({ message: 'Пользователя с таким логином нет' });
                    return;
                }
                let { AccessToken, RefreshToken } = generateTokens({ login });
                let jsonResponse = {
                    user: { login },
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
                let { login } = token;
                let user = yield UserModel_1.default.findOne({ login });
                if (!user)
                    return res.sendStatus(401);
                let { _id } = user;
                let response = {
                    user: {
                        user_id: _id,
                        login
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
}
exports.default = new Controller();
