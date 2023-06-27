import express from 'express'
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'
import cors from "cors";
import dotenv from 'dotenv'
import GetAuthRouter from './routes/AuthRouter/GetAuthRouter';
import GetCardsRouter from './routes/CardsRouter/GetCardsRouter';
dotenv.config()

export const app = express()

let jsonBodyMiddleware = express.json()
app.use(cors({
    origin: process.env.FRONT_URL,
    credentials: true,
    
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(jsonBodyMiddleware)
app.set('trust proxy', 1);


const AuthRouter = GetAuthRouter()
const CardsRouter = GetCardsRouter()

app.use('/auth', AuthRouter)
app.use('/cards', CardsRouter)