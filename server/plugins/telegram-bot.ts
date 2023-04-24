import telegramBot from '../telegram-bot'

export default defineNitroPlugin((nitroApp) => {
    telegramBot.launch()

    process.once('SIGINT', () => telegramBot.stop('SIGINT'))
    process.once('SIGTERM', () => telegramBot.stop('SIGTERM'))
})
