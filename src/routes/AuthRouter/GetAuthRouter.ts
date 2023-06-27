import { Router } from "express"
import Controller from "./AuthController"


const GetAuthRouter = () => {
    const router = Router()
    router.post('/signin', Controller.signin)
    router.post('/login', Controller.login)
    router.delete('/login', Controller.logout)
    router.get('/refresh', Controller.refresh)
    router.get('/logged', Controller.isLogged)
    router.get('/activate/:key', Controller.activate)
    router.post('/restore', Controller.sendRestoreLink)
    router.post('/set_new_password', Controller.setNewPassword)
    return router
}

export default GetAuthRouter