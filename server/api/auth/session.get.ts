import crc32 from 'crc/crc32'

export default defineEventHandler(async (event) => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const user = await prisma.user.findUnique({
        where: { id: tokenData.id },
    })

    if (!user) {
        return sendError(
            event,
            createError({
                statusCode: 400,
                statusMessage: 'User not found'
            })
        )
    }

    if (tokenData.password !== crc32(user.password).toString(16)) {
        return sendError(
            event,
            createError({
                statusCode: 401,
                statusMessage: 'Invalid token credentials'
            })
        )
    }

    return {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        middleName: user.middleName
    } as SessionData
})
