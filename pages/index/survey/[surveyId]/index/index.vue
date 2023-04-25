<template>
    <div class="p-3">
        <div class="flex justify-content-end p-1">
            <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurvey" @click="() => refreshSurvey()" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

const route = useRoute()

const {
    data: survey,
    pending: loadingSurvey,
    refresh: refreshSurvey
} = useFetch('/api/telegram/survey/info', { query: { surveyId: route.params.surveyId } })
</script>
