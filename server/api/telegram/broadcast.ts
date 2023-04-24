
export default defineEventHandler(async event => {
    const tokenData = readTokenData(event)
    if (!tokenData) return

    const query = getQuery(event) as { text: string }

    return { success: true }
})
