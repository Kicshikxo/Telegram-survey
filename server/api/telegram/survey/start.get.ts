import { SurveyStatus } from "@prisma/client"
import { sendSurveyQuestion } from "~/server/telegram-bot"

export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { surveyId: string }
    if (!query.surveyId) return sendError(event, createError({ statusCode: 400, statusMessage: 'surveyId is not provided' }))

    const survey = await prisma.survey.findUnique({ where: { id: query.surveyId }, include: { respondents: true } })
    if (!survey) return

    for (const respondent of survey?.respondents ?? []) {
        await sendSurveyQuestion({ survey, respondent, index: 0 })
    }

    await prisma.survey.update({ where: { id: survey.id }, data: { status: SurveyStatus.IN_PROGRESS } })

    return { success: true }
})
