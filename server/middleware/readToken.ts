import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
    const headerToken = getHeaders(event).authorization?.substring('Bearer '.length)
    const cookieToken = getCookie(event, 'auth-token')

    if (!headerToken && !cookieToken) return

    let tokenData: AuthTokenData
    try {
        tokenData = jwt.verify(headerToken ?? cookieToken!, process.env.JWT_SECRET_KEY!) as AuthTokenData
    } catch (e) {
        return
    }

    event.context.authTokenData = tokenData
})
