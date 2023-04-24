import { H3Event, sendError } from 'h3'

export default function (event: H3Event): AuthTokenData | void {
    const tokenData = event.context.authTokenData as AuthTokenData
    if (!tokenData) {
        return sendError(
            event,
            createError({
                statusCode: 401,
                statusMessage: 'Unable to read token data'
            })
        )
    }
    return tokenData
}
