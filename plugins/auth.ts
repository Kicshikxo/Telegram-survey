export default defineNuxtPlugin(async (nuxtApp) => {
    const { state, getSession } = useAuth()
    if (state.status.value === 'unauthenticated') {
        await getSession()
    }
})
