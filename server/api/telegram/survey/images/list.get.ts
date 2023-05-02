export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { surveyId: string }
    if (!query.surveyId) return sendError(event, createError({ statusCode: 400, statusMessage: 'surveyId is not provided' }))

    return await prisma.generatedSurveyImage.findMany({ where: { surveyId: query.surveyId }, include: { survey: true, respondent: true }, orderBy: { createdAt: 'desc' } })
})
