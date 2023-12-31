import express from 'express'
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'
import cors from "cors";
import dotenv from 'dotenv'
import GetAuthRouter from './routes/AuthRouter/GetAuthRouter';
import GetCardsRouter from './routes/CardsRouter/GetCardsRouter';
import cookieSession from 'cookie-session';
dotenv.config()

export const app = express()

let jsonBodyMiddleware = express.json()
app.use(cors({
    origin: process.env.FRONT_URL,
    credentials: true
}))
app.use(
    cookieSession({
        secret: 'gvdfgbvsreghbtrsfhb',
        sameSite: 'none',
        secure: true,
        httpOnly: true,
    }),
);
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(jsonBodyMiddleware)
app.enable('trust proxy');


const AuthRouter = GetAuthRouter()
const CardsRouter = GetCardsRouter()

app.use('/auth', AuthRouter)
app.use('/cards', CardsRouter)