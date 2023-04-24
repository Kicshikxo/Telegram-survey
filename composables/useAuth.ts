const signIn = async (options: SingInOptions): Promise<SignInResult> => {
    const router = useRouter()

    const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { username: options.username, password: options.password } as LoginData
    })

    await getSession()

    if (options.redirectTo) {
        router.push(options.redirectTo)
    }

    return {
        status: error.value?.status ?? 200,
        error: error.value?.statusMessage ?? null,
        data: data.value
    }
}

const signOut = async (options: SignOutOptions) => {
    const router = useRouter()

    await useFetch('/api/auth/logout')
    await getSession()

    if (options.redirectTo) {
        router.push(options.redirectTo)
    }
}

const getSession = async (): Promise<GetSessionResult> => {
    const { data: sessionData } = useAuthState()

    const { data, error } = await useFetch('/api/auth/session')

    sessionData.value = data.value

    return {
        status: error.value?.status ?? 200,
        error: error.value?.statusMessage ?? null,
        data: data.value
    }
}

export default () => {
    const { data, status } = useAuthState()

    return {
        signIn,
        signOut,
        getSession,
        state: {
            data,
            status
        }
    }
}
