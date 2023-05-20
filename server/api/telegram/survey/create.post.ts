export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const body = await readBody(event) as {
        title: string
    }
    if (body.title === undefined) return sendError(event, createError({ statusCode: 400, statusMessage: 'title is not provided' }))

    return await prisma.survey.create({ data: { userId: tokenData.id, title: body.title } })
})
