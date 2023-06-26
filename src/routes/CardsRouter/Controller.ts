import CardModel from "../../dataflow/mongodb/models/CardModel"
import { createCardReq_T, createCardRes_T, deleteCardReq_T, deleteCardRes_T, getCardsRes_T, updateCardReq_T, updateCardRes_T } from "./types"



class Controller {
    async createCard(req: createCardReq_T, res: createCardRes_T) {
        try {
            const { value } = req.body
            const { user_id } = res.locals.TokenPayload
            if (!value) return res.status(400).json({ message: 'Не все поля заполнены' })

            const card = await CardModel.create({ value, user_id })

            res.status(201).json({ card })
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async getCards(req: any, res: getCardsRes_T) {
        try {
            const { user_id } = res.locals.TokenPayload
            const cards = await CardModel.find({ user_id })

            res.status(200).json({ cards })
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async deleteCard(req: deleteCardReq_T, res: deleteCardRes_T) {
        try {
            const { card_id } = req.params
            const { user_id } = res.locals.TokenPayload

            await CardModel.deleteOne({ _id: card_id, user_id })

            res.sendStatus(200)
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
    async updateCard(req: updateCardReq_T, res: updateCardRes_T) {
        try {
            const { value, completed } = req.body
            const { card_id } = req.params
            const { user_id } = res.locals.TokenPayload
            console.log(value, completed, user_id, card_id)
            await CardModel.updateOne({ _id: card_id, user_id }, {
                completed, value
            })
            res.sendStatus(200)
        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }
}

export default new Controller()