import { SurveyStatus } from "@prisma/client"

export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { surveyId: string }
    if (!query.surveyId) return sendError(event, createError({ statusCode: 400, statusMessage: 'surveyId is not provided' }))

    const survey = await prisma.survey.findUnique({ where: { id: query.surveyId } })
    if (!survey) return

    await prisma.survey.update({ where: { id: survey.id }, data: { shortId: null, status: SurveyStatus.DELETED } })

    return { success: true }
})
