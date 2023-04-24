import { SurveyStatus } from "@prisma/client";
import { Telegraf, deunionize } from "telegraf";

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY!)

telegramBot.start(async (ctx) => {
    await ctx.reply('Введите своё ФИО через команду /auth')
})
telegramBot.command('auth', async (ctx) => {
    const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from.id } })
    if (respondent) return await ctx.reply('Вы уже авторизованы')

    const { text } = deunionize(ctx.message)
    const name = text?.match(/[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+/)?.at(0)
    if (!name) return await ctx.reply('Неверный формат ФИО')

    const [secondName, firstName, middleName] = name.split(' ')
    await prisma.respondent.create({
        data: {
            secondName, firstName, middleName,
            telegramId: ctx.from.id
        }
    })
    await ctx.reply(`Вы успешно авторизованы`)
})
telegramBot.command('join', async (ctx) => {
    const respondent = await prisma.respondent.findUnique({ where: { telegramId: ctx.from.id } })
    if (!respondent) return await ctx.reply('Вы не авторизованы')

    const { text } = deunionize(ctx.message)
    const surveyShortId = text?.match(/[A-Z0-9]{4}/)?.at(0)
    if (!surveyShortId) return await ctx.reply('Неверный формат кода комнаты')

    if (await prisma.respondent.findFirst({ where: { telegramId: ctx.from.id, surveys: { some: { shortId: surveyShortId, status: SurveyStatus.NOT_STARTED } } } }))
        return await ctx.reply(`Вы уже вошли в комнату ${surveyShortId}`)

    const survey = await prisma.survey.findFirst({ where: { shortId: surveyShortId, status: SurveyStatus.NOT_STARTED } })
    if (!survey) return await ctx.reply(`Комната ${surveyShortId} не существует`)

    await prisma.respondent.update({
        where: { telegramId: ctx.from.id },
        data: { surveys: { connect: { id: survey.id } } }
    })
    await ctx.reply(`Вы присоединились к комнате ${surveyShortId}`)
})

telegramBot.telegram.setMyCommands([
    {
        command: '/auth',
        description: 'Авторизация в системе'
    },
    {
        command: '/join',
        description: 'Подключение к комнате'
    }
])

export default telegramBot
