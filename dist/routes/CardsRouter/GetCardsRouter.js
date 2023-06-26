"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_1 = __importDefault(require("./Controller"));
const CheckAccessToken_1 = __importDefault(require("../middlewares/CheckAccessToken"));
const GetCardsRouter = () => {
    const router = (0, express_1.Router)();
    router.post('/', CheckAccessToken_1.default, Controller_1.default.createCard);
    router.get('/', CheckAccessToken_1.default, Controller_1.default.getCards);
    router.delete('/:card_id', CheckAccessToken_1.default, Controller_1.default.deleteCard);
    router.put('/:card_id', CheckAccessToken_1.default, Controller_1.default.updateCard);
    return router;
};
exports.default = GetCardsRouter;
