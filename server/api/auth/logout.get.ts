export default defineEventHandler((event) => {
    deleteCookie(event, 'auth-token')
    return {
        statusCode: 200
    }
})
