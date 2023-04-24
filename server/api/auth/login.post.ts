import { compare } from 'bcrypt'
import crc32 from 'crc/crc32'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const loginData: LoginData = await readBody(event)

    if (!loginData.username || !loginData.password) {
        return sendError(
            event,
            createError({
                statusCode: 400,
                statusMessage: 'Invalid login params'
            })
        )
    }

    const user = await prisma.user.findFirst({
        where: { username: loginData.username },
    })
    if (user && (await compare(loginData.password, user!.password))) {
        const token = jwt.sign(
            {
                id: user.id,
                password: crc32(user.password).toString(16)
            } as AuthTokenData,
            process.env.JWT_SECRET_KEY ?? ' '
        )
        setCookie(event, 'auth-token', token, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            sameSite: true
        })
        return { token }
    }

    return sendError(
        event,
        createError({
            statusCode: 401,
            statusMessage: 'Incorrect login credentials'
        })
    )
})
