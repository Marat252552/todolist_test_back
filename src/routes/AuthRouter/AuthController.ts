import UserModel from "../../dataflow/mongodb/models/UserModel"
import { TokenPayload_T } from "../../shared/types" 
import { LoginReq_T, SigninReq_T, RefreshReq_T, isLoggedReq_T } from "./types"
import jwt from 'jsonwebtoken'
import { hashSync, compareSync } from 'bcrypt'


let generateTokens = (payload: TokenPayload_T) => {
    let AccessKey = process.env.JWT_ACCESS_KEY!
    let RefreshKey = process.env.JWT_REFRESH_KEY!
    
    let AccessToken = jwt.sign(payload, AccessKey, { expiresIn: '30m' })
    let RefreshToken = jwt.sign(payload, RefreshKey, { expiresIn: '30d' })

    return { AccessToken, RefreshToken }
}

class Controller {
    async signin(req: SigninReq_T, res: any) {
        console.log('signin')
        try {
            let { login, password, remember = true } = req.body
            if (!login || !password) return res.status(400).json({ message: 'Заполнены не все поля' })

            let isLoginTaken = await UserModel.exists({ login })
            if (isLoginTaken) return res.status(400).json({ message: 'Логин уже занят' })

            let hashedPassword = hashSync(password, 7)

            let user = await UserModel.create({ login, password: hashedPassword })
            if (!user) return res.sendStatus(500)

            let { _id } = user
            let { AccessToken, RefreshToken } = generateTokens({ login, user_id: user._id.toString()})

            let jsonResponse = {
                user: {
                    user_id: _id,
                    login
                },
                AccessToken
            }

            res.status(201)
            if (remember) {
                res.cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                    .json(jsonResponse)
            } else {
                res.json(jsonResponse)
            }

        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async login(req: LoginReq_T, res: any) {
        try {
            let { login, password, remember = true } = req.body
            if (!login || !password) return res.sendStatus(400)

            let user = await UserModel.findOne({ login })
            if (!user) return res.status(400).json({ message: 'Пользователя с таким логином нет' })
            let isPasswordValid = compareSync(password, user.password)
            if (!isPasswordValid) return res.status(400).json({ message: 'Пароль неверный' })

            let { _id } = user
            let { AccessToken, RefreshToken } = generateTokens({ login, user_id: user._id.toString() })

            let jsonResponse = {
                user: {
                    user_id: _id,
                    login
                },
                AccessToken
            }
            res
            .status(200)
            .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            .json(jsonResponse)
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
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async refresh(req: RefreshReq_T, res: any) {
        try {
            let OldRefreshToken = req.cookies.refresh_token
            if (!OldRefreshToken) return res.sendStatus(400)

            let decryptedToken = jwt.verify(OldRefreshToken, process.env.JWT_REFRESH_KEY!) as TokenPayload_T
            if (!decryptedToken) return res.sendStatus(400)
            let { login, user_id } = decryptedToken

            let DoesUserExist = await UserModel.exists({ login })
            if (!DoesUserExist) {
                res.status(400).json({ message: 'Пользователя с таким логином нет' })
                return
            }

            let { AccessToken, RefreshToken } = generateTokens({ login, user_id })
            let jsonResponse = {
                user: { login },
                AccessToken
            }

            res
                .status(200)
                .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                .json(jsonResponse)
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async logout(req: any, res: any) {
        try {
            res.clearCookie('refresh_token').status(200).end()
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async isLogged(req: isLoggedReq_T, res: any) {
        try {
            if (!req.headers.authorization) {
                return res.sendStatus(403)
            }
            let accessToken = req.headers.authorization.split(' ')[1]

            let token = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY!) as TokenPayload_T

            let { login } = token
            let user = await UserModel.findOne({ login })
            if (!user) return res.sendStatus(401)

            let { _id } = user

            let response = {
                user: {
                    user_id: _id,
                    login
                }
            }

            res.status(200).json(response)
        } catch (e) {
            console.log(e)
            res.sendStatus(403)
        }
    }
}

export default new Controller()