import { Router } from "express"
import Controller from "./Controller"
import CheckAccessToken from "../middlewares/CheckAccessToken"



const GetCardsRouter = () => {
    const router = Router()
    router.post('/', CheckAccessToken, Controller.createCard)
    router.get('/', CheckAccessToken, Controller.getCards)
    router.delete('/:card_id', CheckAccessToken, Controller.deleteCard)
    router.put('/:card_id', CheckAccessToken, Controller.updateCard)
    return router
}

export default GetCardsRouter