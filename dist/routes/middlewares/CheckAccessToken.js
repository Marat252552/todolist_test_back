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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../../dataflow/mongodb/models/UserModel"));
const CheckAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let AccessToken = req.headers.authorization.split(' ')[1];
        jsonwebtoken_1.default.verify(AccessToken, process.env.JWT_ACCESS_KEY);
        let TokenPayload = jsonwebtoken_1.default.decode(AccessToken);
        const DoesUserExist = yield UserModel_1.default.exists({ _id: TokenPayload.user_id });
        if (!DoesUserExist)
            return res.status(401).json({ message: 'Пользователь не найден' });
        res.locals.TokenPayload = TokenPayload;
        next();
    }
    catch (e) {
        console.log(e);
        res.sendStatus(403);
    }
});
exports.default = CheckAccessToken;
