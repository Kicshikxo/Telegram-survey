import { } from '~'

declare global {
    interface LoginData {
        username?: string
        password?: string
    }

    interface SingInOptions {
        username?: string
        password?: string
        redirectTo?: string
    }

    interface SignInResult {
        status: number
        error: string | null
        data: { token: string } | null
    }

    interface SignOutOptions {
        redirectTo?: string
    }

    interface AuthTokenData {
        id: string
        password: string
    }

    interface SessionData {
        id: string
        firstName: string
        secondName: string
        middleName: string
    }

    interface GetSessionResult {
        status: number
        error: string | null
        data: SessionData | null
    }
}
