export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { surveyId: string }

    if (!query.surveyId) return sendError(event, createError({ statusCode: 400, statusMessage: 'surveyId is not provided' }))

    return await prisma.survey.findUnique({ where: { id: query.surveyId }, include: { respondents: true, questions: { include: { options: { include: { answers: { include: { respondent: true } } } } }, orderBy: { index: 'asc' } } } })
})
