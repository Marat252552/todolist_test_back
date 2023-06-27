import UserModel from "../../dataflow/mongodb/models/UserModel"
import { TokenPayload_T } from "../../shared/types"
import { LoginReq_T, SigninReq_T, RefreshReq_T, isLoggedReq_T, activateReq_T, sendRestoreLinkReq_T, setNewPasswordReq_T } from "./types"
import jwt from 'jsonwebtoken'
import { hashSync, compareSync } from 'bcrypt'
import ActivationLinkModel from "../../dataflow/mongodb/models/ActivationLinkModel"
import { v4 } from 'uuid'
import { sendActivationLink, sendRestoreLink } from "../../shared/MailService"
import RestoreLinkModel from "../../dataflow/mongodb/models/RestoreLinkModel"


let generateTokens = (payload: TokenPayload_T) => {
    let AccessKey = process.env.JWT_ACCESS_KEY!
    let RefreshKey = process.env.JWT_REFRESH_KEY!

    let AccessToken = jwt.sign(payload, AccessKey, { expiresIn: '30m' })
    let RefreshToken = jwt.sign(payload, RefreshKey, { expiresIn: '30d' })

    return { AccessToken, RefreshToken }
}

class Controller {
    async signin(req: SigninReq_T, res: any) {
        try {
            let { email, password } = req.body
            if (!email || !password) return res.status(400).json({ message: 'Заполнены не все поля' })

            if(email.length <= 6 || password.length <= 6) return res.status(400).json({message: 'Минимальное количество символов пароля и почты 6'})

            if(email.length >= 50 || password.length >= 50) return res.status(400).json({message: 'Максимальное количество символов пароля и почты 50'})

            email = email.toLowerCase()

            let isLoginTaken = await UserModel.exists({ email })
            if (isLoginTaken) return res.status(400).json({ message: 'Логин уже занят' })

            let hashedPassword = hashSync(password, 7)
            let user = await UserModel.create({ email, password: hashedPassword })
            if (!user) return res.sendStatus(500)

            let { _id } = user
            const activation_key = v4()
            await ActivationLinkModel.create({ user_id: _id, key: activation_key })
            const activationLink = process.env.BACKEND_URL + '/auth/activate/' + activation_key

            sendActivationLink(email, activationLink)

            res.sendStatus(201)

        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async login(req: LoginReq_T, res: any) {
        try {
            let { email, password, remember = true } = req.body
            if (!email || !password) return res.sendStatus(400)

            email = email.toLowerCase()

            let user = await UserModel.findOne({ email })
            if (!user) return res.status(400).json({ message: 'Пользователя с таким логином нет' })
            
            let isPasswordValid = compareSync(password, user.password)
            if (!isPasswordValid) return res.status(400).json({ message: 'Пароль неверный' })

            const isNotActivated = await ActivationLinkModel.exists({ user_id: user._id })
            if (isNotActivated) return res.status(400).json({ message: 'Аккаунт не активирован по почте' })

            let { _id } = user
            let { AccessToken, RefreshToken } = generateTokens({ email, user_id: user._id.toString() })

            let jsonResponse = {
                user: {
                    user_id: _id,
                    email
                },
                AccessToken
            }

            if (remember) {
                res
                    .status(200)
                    .cookie('refresh_token', RefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
                    .json(jsonResponse)
            } else {
                res
                    .status(200)
                    .json(jsonResponse)
            }
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
            let { email, user_id } = decryptedToken

            let DoesUserExist = await UserModel.exists({ email })
            if (!DoesUserExist) {
                res.status(400).json({ message: 'Пользователя с таким логином нет' })
                return
            }

            let { AccessToken, RefreshToken } = generateTokens({ email, user_id })
            let jsonResponse = {
                user: { email },
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

            let { email } = token
            let user = await UserModel.findOne({ email })
            if (!user) return res.sendStatus(401)

            let { _id } = user

            let response = {
                user: {
                    user_id: _id,
                    email
                }
            }

            res.status(200).json(response)
        } catch (e) {
            console.log(e)
            res.sendStatus(403)
        }
    }
    async activate(req: activateReq_T, res: any) {
        try {
            const { key } = req.params
            console.log(key)
            const result = await ActivationLinkModel.deleteOne({ key })
            // console.log(result)
            res.sendStatus(200)
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async sendRestoreLink(req: sendRestoreLinkReq_T, res: any) {
        try {
            const { email } = req.body
            if (!email) return res.sendStatus(400).json({ message: 'Почта не указана' })

            const DoesUserExist = await UserModel.exists({ email })
            if (!DoesUserExist) return res.status(400).json({ message: 'Пользователь с указанной почтой не найден' })

            const AlreadyExistingLink = await RestoreLinkModel.findOne({ email })
            if (AlreadyExistingLink && AlreadyExistingLink.expiresIn > new Date()) return res.status(400).json({ message: 'Ссылка уже отправлена. Создание новой возможно не ранее чем через 30 минут' })


            const key = v4()
            const RestoreLink = process.env.FRONT_URL + '/#/new_password/' + key
            await RestoreLinkModel.create({ email, key })

            sendRestoreLink(email, RestoreLink)

            res.status(200).json({ message: 'Ссылка на восстановление пароля отправлена на указанную почту' })
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async setNewPassword(req: setNewPasswordReq_T, res: any) {
        try {
            const { key, password } = req.body
            if(!key || !password) return res.status(400).json({message: 'Заполнены не все поля'})

            const RestoreLink = await RestoreLinkModel.findOne({key})
            if(!RestoreLink) return res.status(400).json({message: 'Ссылка на восстановление пароля не найдена'})
            const {email} = RestoreLink

            const user = await UserModel.findOne({email})
            if(!user) return res.status(400).json({message: 'Пользователь не найден'})

            const ArePasswordsEqual = compareSync(password, user.password)
            if(ArePasswordsEqual) return res.status(400).json({message: 'Новый пароль должен отличаться от предыдущего'})

            const hashedPassword = hashSync(password, 7)
            
            await UserModel.updateOne({email}, {password: hashedPassword})
            await RestoreLinkModel.deleteOne({key})

            res.status(200).json({message: 'Пароль успешно изменен'})
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
}

export default new Controller()