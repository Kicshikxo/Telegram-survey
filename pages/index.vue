<template>
    <main>
        <nav class="flex">
            <TabMenu :model="tabs" />
            <div class="flex justify-content-end align-items-center flex-auto border-bottom-2 surface-border">
                <Button label="Выйти" icon="pi pi-sign-out" severity="danger" class="mr-1" text @click="confirmSignOut" />
            </div>
        </nav>
        <nuxt-layout :name="false">
            <nuxt-page />
        </nuxt-layout>
    </main>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import TabMenu from 'primevue/tabmenu'
import { useConfirm } from 'primevue/useconfirm'

const { signOut } = useAuth()
const confirm = useConfirm()

function confirmSignOut() {
    confirm.require({
        header: 'Подтверждение выхода',
        message: 'Вы действительно хотите выйти?',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-danger',
        accept: () => {
            signOut({ redirectTo: '/login' })
        }
    })
}

const tabs = ref([
    {
        label: 'Домашняя страница',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        label: 'Опросы',
        icon: 'pi pi-th-large',
        to: '/survey'
    },
    {
        label: 'Опрашиваемые',
        icon: 'pi pi-users',
        to: '/respondents'
    }
])
</script>
