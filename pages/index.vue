<template>
    <div class="flex flex-column justify-content-center align-items-center w-screen h-screen gap-3">
        <InputText v-model="broadcastText" />
        <Button label="Отправить сообщение всем" @click="broadcast" />
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const broadcastText = ref<string>()

async function broadcast() {
    console.log(broadcastText.value)
    if (!broadcastText.value) {
        toast.add({ severity: 'error', summary: 'Введите текст', life: 3000 })
        return
    }

    const { error, pending: loading } = await useFetch('/api/telegram/broadcast', {
        query: { text: broadcastText.value }
    })
}
</script>
