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
const mongoose_1 = __importDefault(require("mongoose"));
let DBconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    let login = process.env.MONGO_DB_LOGIN;
    let password = process.env.MONGO_DB_PASSWORD;
    try {
        yield mongoose_1.default.connect(`mongodb+srv://${login}:${password}@cluster0.xo4bpah.mongodb.net/`);
        if (mongoose_1.default.connection.readyState === 1) {
            console.log('Mongo DB connected');
        }
        else if (mongoose_1.default.connection.readyState === 0) {
            console.log('Mongo DB connection error');
        }
        else {
            console.log(mongoose_1.default.connection.readyState);
        }
    }
    catch (e) {
        console.log(mongoose_1.default.connection.readyState);
        console.log(e);
    }
});
exports.default = DBconnect;
