<template>
    <main>
        <TabMenu :model="tabs" />
        <nuxt-layout :name="false">
            <nuxt-page />
        </nuxt-layout>
    </main>
</template>

<script setup lang="ts">
import TabMenu from 'primevue/tabmenu'

const route = useRoute()

const tabs = ref([
    {
        label: 'Опрос',
        icon: 'pi pi-question',
        to: `/survey/${route.params.surveyId}`
    },
    {
        label: 'Статистика',
        icon: 'pi pi-chart-pie',
        to: `/survey/${route.params.surveyId}/statistics`
    }
])
</script>
