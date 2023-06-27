import { Request } from "express"

export type SigninReq_T = {
    body: {
        email: string,
        password: string,
        remember?: boolean
    }
}

export type LoginReq_T = {
    body: {
        email: string,
        password: string,
        remember?: boolean
    }
}

export type activateReq_T = Request<{
    key: string
}, void, void>

export type RefreshReq_T = {
    cookies: {
        refresh_token: string
    }
}

export type isLoggedReq_T = {
    headers: {
        authorization: string
    }
}

export type sendRestoreLinkReq_T = Request<void, void, {
    email: string
}>

export type setNewPasswordReq_T = Request<void, void, {
    key: string,
    password: string
}>