import jwt from 'jsonwebtoken'
import { TokenPayload_T } from './types'


const GenerateTokens = (TokenPayload: TokenPayload_T) => {
    try {
        const AccessKey = process.env.ACCESS_KEY_SECRET!
        const RefreshKey = process.env.REFRESH_KEY_SECRET!
        const AccessToken = jwt.sign(TokenPayload, AccessKey)
        const RefreshToken = jwt.sign(TokenPayload, RefreshKey)
        return {AccessToken, RefreshToken}
    } catch(e) {
        console.log(e)
    }
}

export default GenerateTokens

