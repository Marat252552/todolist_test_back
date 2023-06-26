import { Router } from "express"
import Controller from "./AuthController"

const GetAuthRouter = () => {
    const router = Router()
    router.post('/signin', Controller.signin)
    router.post('/login', Controller.login)
    router.delete('/login', Controller.logout)
    router.get('/refresh', Controller.refresh)
    router.get('/logged', Controller.isLogged)
    return router
}

export default GetAuthRouter