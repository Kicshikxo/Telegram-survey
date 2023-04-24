export default defineNuxtRouteMiddleware(async (to) => {
    if (to.meta.auth === false) return

    const { state } = useAuth()
    if (state.status.value === 'authenticated') return

    return navigateTo(`/login?redirectTo=${to.fullPath}`)
})
