export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const body = await readBody(event) as {
        id: string
        title: string
        questions: {
            id: string
            title: string
            index: number
            options: {
                id: string
                value: string
            }[]
        }[]
    }
    if (!body.id) return sendError(event, createError({ statusCode: 400, statusMessage: 'id is not provided' }))

    const survey = await prisma.survey.findUnique({ where: { id: body.id } })
    if (!survey) return

    await prisma.survey.update({
        where: { id: survey.id },
        data: {
            title: body.title,
        }
    })

    const questionsBeforeUpdate = await prisma.surveyQuestion.findMany({ where: { surveyId: survey.id } })
    await prisma.$transaction(questionsBeforeUpdate.map(question => {
        const update = body.questions.find(({ id }) => id === question.id)
        if (update) return prisma.surveyQuestion.update({
            where: { id: question.id },
            data: {
                index: update.index,
                title: update.title,
                options: {
                    upsert: update.options.map(option => ({
                        where: { id: option.id },
                        create: { value: option.value },
                        update: { value: option.value }
                    }))
                }
            }
        })

        return prisma.surveyQuestion.delete({ where: { id: question.id } })
    }))

    const questionsAfterUpdate = await prisma.surveyQuestion.findMany({ where: { surveyId: survey.id } })
    await prisma.$transaction(body.questions.filter(question => !questionsAfterUpdate.some(({ id }) => question.id === id)).map(question =>
        prisma.surveyQuestion.create({
            data: {
                surveyId: survey.id,
                index: question.index,
                title: question.title,
                options: {
                    createMany: { data: question.options.map(option => ({ value: option.value })) }
                }
            }
        })
    ))

    return { success: true }
})
