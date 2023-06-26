export type SigninReq_T = {
    body: {
        login: string,
        password: string,
        remember?: boolean
    }
}

export type LoginReq_T = {
    body: {
        login: string,
        password: string,
        remember?: boolean
    }
}

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