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
const CardModel_1 = __importDefault(require("../../dataflow/mongodb/models/CardModel"));
class Controller {
    createCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { value } = req.body;
                const { user_id } = res.locals.TokenPayload;
                if (!value)
                    return res.status(400).json({ message: 'Не все поля заполнены' });
                const card = yield CardModel_1.default.create({ value, user_id });
                res.status(201).json({ card });
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    getCards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = res.locals.TokenPayload;
                const cards = yield CardModel_1.default.find({ user_id });
                res.status(200).json({ cards });
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    deleteCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { card_id } = req.params;
                const { user_id } = res.locals.TokenPayload;
                yield CardModel_1.default.deleteOne({ _id: card_id, user_id });
                res.sendStatus(200);
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
    updateCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { value, completed } = req.body;
                const { card_id } = req.params;
                const { user_id } = res.locals.TokenPayload;
                console.log(value, completed, user_id, card_id);
                yield CardModel_1.default.updateOne({ _id: card_id, user_id }, {
                    completed, value
                });
                res.sendStatus(200);
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        });
    }
}
exports.default = new Controller();
