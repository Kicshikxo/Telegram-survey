<template>
    <div>
        <DataTable :value="survey?.respondents" class="p-datatable-lg">
            <template #header>
                <div class="flex justify-content-end">
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurvey" @click="() => refreshSurvey()" />
                </div>
            </template>
            <Column field="secondName" header="Фамилия" />
            <Column field="firstName" header="Имя" />
            <Column field="middleName" header="Отчество" />
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const route = useRoute()

const {
    data: survey,
    pending: loadingSurvey,
    refresh: refreshSurvey
} = useFetch('/api/telegram/survey/info', { query: { surveyId: route.params.surveyId } })
</script>
