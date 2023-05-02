<template>
    <div>
        <DataTable :value="survey?.respondents" removableSort class="p-datatable-lg">
            <template #header>
                <div class="flex justify-content-end">
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurvey" @click="() => refreshSurvey()" />
                </div>
            </template>
            <Column field="secondName" header="Фамилия" sortable />
            <Column field="firstName" header="Имя" sortable />
            <Column field="middleName" header="Отчество" sortable />
            <Column field="middleName" header="Оценка">
                <template #body="{ data }">
                    <Dropdown :options="[2, 3, 4, 5]" placeholder="Выберите оценку" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column/Column.vue'
import DataTable from 'primevue/datatable/DataTable.vue'
import Dropdown from 'primevue/dropdown/Dropdown.vue'

const route = useRoute()

const {
    data: survey,
    pending: loadingSurvey,
    refresh: refreshSurvey
} = useFetch('/api/telegram/survey/info', { query: { surveyId: route.params.surveyId } })
</script>
