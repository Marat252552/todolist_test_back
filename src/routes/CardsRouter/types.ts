import { Request, Response } from "express";
import { TokenPayload_T } from "../../shared/types";

export type createCardReq_T = Request<void, void, {
    value: string
}>
export type createCardRes_T = Response<any, {
    TokenPayload: TokenPayload_T
}>

export type getCardsRes_T = Response<any, {
    TokenPayload: TokenPayload_T
}>


export type deleteCardReq_T = Request<{
    card_id: string
}, void, void>
export type deleteCardRes_T = Response<any, {
    TokenPayload: TokenPayload_T
}>


export type updateCardReq_T = Request<{
    card_id: string
}, void, {
    value: string,
    completed: boolean
}>
export type updateCardRes_T = Response<any, {
    TokenPayload: TokenPayload_T
}>