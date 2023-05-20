import { Respondent, Survey, SurveyStatus } from "@prisma/client";
import { Context, Telegraf, deunionize } from "telegraf";
import { CallbackQuery } from "telegraf/typings/core/types/typegram";

export enum CallbackQueryDataType {
    QuestionReply
}

export interface CallbackQueryData {
    type: CallbackQueryDataType
    optionId: string
}

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY!)

telegramBot.start(async (ctx) => {
    await ctx.reply('Введите своё ФИО после команды /auth')
})
telegramBot.command('auth', async (ctx) => {
    try {
        const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from.id.toString() } })
        if (respondent) return await ctx.reply('Вы уже авторизованы')

        const { text } = deunionize(ctx.message)
        const name = text?.match(/[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+/)?.at(0)
        if (!name) return await ctx.reply('Неверный формат ФИО')

        const [secondName, firstName, middleName] = name.split(' ')
        await prisma.respondent.create({
            data: {
                secondName, firstName, middleName,
                telegramId: ctx.from.id.toString()
            }
        })
        await ctx.reply(`Вы успешно авторизованы`)
    }
    catch (e) {
        console.error(e)
        await ctx.reply('Произошла неизвестная ошибка')
    }
})
telegramBot.command('join', async (ctx) => {
    try {
        const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from.id.toString() } })
        if (!respondent) return await ctx.reply('Вы не авторизованы')

        const currentSurvey = await prisma.survey.findFirst({ where: { respondents: { some: { telegramId: ctx.from.id.toString() } }, status: { notIn: [SurveyStatus.FINISHED, SurveyStatus.DELETED] } } })
        if (currentSurvey) return ctx.reply(`Вы уже участвуете в опросе ${currentSurvey.shortId}, дождитесь его завершения`)

        const { text } = deunionize(ctx.message)
        const surveyShortId = text?.match(/[A-Z0-9]{4}/)?.at(0)
        if (!surveyShortId) return await ctx.reply('Неверный формат идентификатора опроса')

        if (await prisma.respondent.findFirst({ where: { telegramId: ctx.from.id.toString(), surveys: { some: { shortId: surveyShortId, status: SurveyStatus.NOT_STARTED } } } }))
            return await ctx.reply(`Вы уже присоединились к опросу ${surveyShortId}`)

        const survey = await prisma.survey.findFirst({ where: { shortId: surveyShortId, status: SurveyStatus.NOT_STARTED } })
        if (!survey) return await ctx.reply(`Опрос ${surveyShortId} не существует`)

        await prisma.respondent.update({
            where: { telegramId: ctx.from.id.toString() },
            data: { surveys: { connect: { id: survey.id } } }
        })
        await ctx.reply(`Вы присоединились к опросу ${surveyShortId}`)
    }
    catch (e) {
        console.error(e)
        await ctx.reply('Произошла неизвестная ошибка')
    }
})
telegramBot.command('reflection', async (ctx) => {
    try {
        const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from.id.toString() } })
        if (!respondent) return await ctx.reply('Вы не авторизованы')

        const survey = await prisma.survey.findFirst({ where: { respondents: { some: { telegramId: ctx.from.id.toString() } }, status: { in: [SurveyStatus.NOT_STARTED, SurveyStatus.IN_PROGRESS] } } })
        if (!survey) return ctx.reply('Опрос не найден')

        const text = deunionize(ctx.message).text.split(' ').slice(1).join(' ')
        if (!text.trim()) return ctx.reply('Введите текст для генерации из него картинки')

        const message = await ctx.reply('Ожидайте...')

        const response = await $fetch('/api/telegram/survey/stable-diffusion', { query: { surveyId: survey.id, prompt: text } })
        if (response.status !== 'success' || !response.output.length) return ctx.reply('Произошла неизвестная ошибка')

        await prisma.generatedSurveyImage.createMany({ data: response.output.map(url => ({ surveyId: survey.id, respondentId: respondent.id, url, prompt: text, translatedPrompt: response.translatedPrompt })) })
        if (!response.output.length) return await ctx.editMessageText('Ошибка генерации изображения')

        await ctx.replyWithMediaGroup(response.output.map(url => ({ type: 'photo', media: { url } })))
        await ctx.deleteMessage(message.message_id)
    }
    catch (e) {
        console.error(e)
        await ctx.reply('Произошла неизвестная ошибка')
    }
})

export async function sendSurveyQuestion(options: { ctx?: Context, survey: Survey, respondent: Respondent, index: number }) {
    const question = await prisma.surveyQuestion.findFirst({ where: { surveyId: options.survey.id, index: { gte: options.index } }, include: { survey: { include: { _count: { select: { questions: true } } } }, options: true }, orderBy: { index: 'asc' } })
    if (!question) {
        if (options.ctx) options.ctx.editMessageText('Спасибо за прохождение опроса!')
        else telegramBot.telegram.sendMessage(options.respondent.telegramId, 'Спасибо за прохождение опроса!')

        return
    }

    if (options.ctx) options.ctx.editMessageText(`Вопрос №${question.index}/${question.survey._count.questions}: ${question.title}`, {
        reply_markup: {
            inline_keyboard: question.options.map((option) => [{ text: option.value, callback_data: JSON.stringify({ type: CallbackQueryDataType.QuestionReply, optionId: option.id } as CallbackQueryData) }])
        }
    })
    else telegramBot.telegram.sendMessage(options.respondent.telegramId, `Вопрос №${question.index}: ${question.title}`, {
        reply_markup: {
            inline_keyboard: question.options.map((option) => [{ text: option.value, callback_data: JSON.stringify({ type: CallbackQueryDataType.QuestionReply, optionId: option.id } as CallbackQueryData) }])
        }
    })
}
telegramBot.on('callback_query', async (ctx) => {
    const { data: dataString } = ctx.callbackQuery as CallbackQuery.DataQuery
    if (!dataString) return

    const data = JSON.parse(dataString) as CallbackQueryData

    if (data.type === CallbackQueryDataType.QuestionReply) {
        const option = await prisma.surveyQuestionOption.findFirst({ where: { id: data.optionId, question: { survey: { status: SurveyStatus.IN_PROGRESS } } }, include: { question: { include: { survey: true } } } })
        const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from?.id.toString() } })

        if (!option || !respondent) return

        try {
            await prisma.respondentAnswer.create({ data: { respondentId: respondent?.id, optionId: option.id } })
        } catch (e) { console.error(e) }

        sendSurveyQuestion({ ctx, survey: option.question.survey, respondent, index: option.question.index + 1 })
    }
})

telegramBot.telegram.setMyCommands([
    {
        command: '/auth',
        description: 'Авторизация в системе'
    },
    {
        command: '/join',
        description: 'Подключение к опросу'
    },
    {
        command: '/reflection',
        description: 'Генерация изображения'
    },
])

export default telegramBot
