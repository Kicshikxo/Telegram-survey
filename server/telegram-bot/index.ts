import { Telegraf } from "telegraf"

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY!)

telegramBot.start((ctx) => {
    console.log(ctx.chat.id)
    ctx.reply('Welcome')
})

export default telegramBot
