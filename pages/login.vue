<template>
    <div class="flex justify-content-center align-items-center h-screen w-screen surface-ground">
        <Card class="surface-card border-1 surface-border border-round shadow-2 w-full sm:w-24rem">
            <template #title> <div class="pb-2">Войдите в систему</div> </template>
            <template #content>
                <div class="p-fluid flex flex-column gap-4">
                    <div class="p-inputgroup w-full">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-user" />
                        </span>
                        <InputText placeholder="Введите логин" v-model="username" />
                    </div>
                    <div class="p-inputgroup w-full">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-lock" />
                        </span>
                        <InputPassword
                            placeholder="Введите пароль"
                            v-model="password"
                            :feedback="false"
                            @keyup.enter="tryLogin"
                            toggleMask
                        />
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-content-center">
                    <Button label="Войти" icon="pi pi-user" class="w-10rem" :loading="loading" @click="tryLogin" />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputPassword from 'primevue/password'
import { useToast } from 'primevue/usetoast'

definePageMeta({
    auth: false,
    layout: false
})

const route = useRoute()
const toast = useToast()
const { signIn } = useAuth()

const username = ref<string>()
const password = ref<string>()

const loading = ref(false)

async function tryLogin() {
    loading.value = true

    const { error, data } = await signIn({
        username: username.value,
        password: password.value,
        redirectTo: (route.query.redirectTo as string) ?? '/'
    })

    if (error || !data) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка авторизации',
            detail: 'Неверный логин или пароль',
            life: 3000
        })
    }

    loading.value = false
}
</script>

<style>
.p-password-input {
    width: 100% !important;
}
</style>
