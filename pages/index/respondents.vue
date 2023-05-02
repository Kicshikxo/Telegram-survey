<template>
    <div>
        <DataTable
            :value="
                [
                    ...new Map(
                        surveys
                            ?.map((survey) => survey.respondents)
                            .flat()
                            .map((respondent) => [respondent.id, respondent])
                    ).values()
                ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            "
            removableSort
            class="p-datatable-lg"
        >
            <template #header>
                <div class="flex justify-content-end">
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurveys" @click="() => refreshSurveys()" />
                </div>
            </template>
            <Column field="secondName" header="Фамилия" sortable />
            <Column field="firstName" header="Имя" sortable />
            <Column field="middleName" header="Отчество" sortable />
            <Column field="telegramId" header="Телеграм ID" />
            <Column field="createdAt" header="Дата присоединения" sortable>
                <template #body="{ data }">{{ new Date(data.createdAt).toLocaleString() }}</template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column/Column.vue'
import DataTable from 'primevue/datatable/DataTable.vue'

const { data: surveys, pending: loadingSurveys, refresh: refreshSurveys } = useFetch('/api/telegram/survey/list')
</script>
