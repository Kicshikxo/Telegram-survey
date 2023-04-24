import telegramBot from "~/server/telegram-bot"

export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { surveyId: string }

    const survey = await prisma.survey.findUnique({ where: { id: query.surveyId }, include: { respondents: true, questions: { include: { options: true } } } })

    for (const respondent of survey?.respondents ?? []) {
        for (const question of survey?.questions ?? []) {
            telegramBot.telegram.sendMessage(respondent.telegramId, question.title, {
                reply_markup: {
                    inline_keyboard: question.options.map((option) => [{ text: option.value, callback_data: option.id }])
                }
            })
        }
    }

    return { success: true }
})
