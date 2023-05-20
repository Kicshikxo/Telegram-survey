<template>
    <main>
        <nav class="sticky surface-card" style="z-index: 1; top: 58px">
            <TabMenu :model="tabs" />
        </nav>
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
        label: 'Вопросы',
        icon: 'pi pi-question',
        to: `/survey/${route.params.surveyId}`
    },
    {
        label: 'Изображения',
        icon: 'pi pi-image',
        to: `/survey/${route.params.surveyId}/images`
    },
    {
        label: 'Участники',
        icon: 'pi pi-users',
        to: `/survey/${route.params.surveyId}/respondents`
    },
    {
        label: 'Статистика',
        icon: 'pi pi-chart-pie',
        to: `/survey/${route.params.surveyId}/statistics`
    }
])
</script>
