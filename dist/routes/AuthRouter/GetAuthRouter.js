"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("./AuthController"));
const GetAuthRouter = () => {
    const router = (0, express_1.Router)();
    router.post('/signin', AuthController_1.default.signin);
    router.post('/login', AuthController_1.default.login);
    router.delete('/login', AuthController_1.default.logout);
    router.get('/refresh', AuthController_1.default.refresh);
    router.get('/logged', AuthController_1.default.isLogged);
    router.get('/activate/:key', AuthController_1.default.activate);
    router.post('/restore', AuthController_1.default.sendRestoreLink);
    router.post('/set_new_password', AuthController_1.default.setNewPassword);
    return router;
};
exports.default = GetAuthRouter;
