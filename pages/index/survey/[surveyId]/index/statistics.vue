<template>
    <div>
        <TabView scrollable>
            <TabPanel v-for="question in survey?.questions" :header="`Вопрос №${question.index}: ${question.title}`">
                <div class="flex justify-content-end">
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurvey" @click="() => refreshSurvey()" />
                </div>
                <Chart
                    type="doughnut"
                    :data="{
                        labels: question.options.map((option) => option.value),
                        datasets: [{ data: question.options.map((option) => option.answers.length) }]
                    }"
                    :options="chartOptions"
                    class="w-full h-30rem"
                />
                <DataTable
                    :value="
                        question.options
                            .map((option) => option.answers.map((answer) => ({ answer, option })))
                            .flat()
                            .sort((a, b) => a.answer.createdAt.localeCompare(b.answer.createdAt))
                            .reverse()
                    "
                    class="p-datatable-lg"
                >
                    <Column field="answer.respondent.secondName" header="Фамилия" />
                    <Column field="answer.respondent.firstName" header="Имя" />
                    <Column field="answer.respondent.middleName" header="Отчество" />
                    <Column field="option.value" header="Ответ" />
                    <Column field="answer.createdAt" header="Время ответа">
                        <template #body="{ data }">{{ new Date(data.answer.createdAt).toLocaleString() }}</template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Chart from 'primevue/chart/Chart.vue'
import Column from 'primevue/column/Column.vue'
import DataTable from 'primevue/datatable/DataTable.vue'
import TabPanel from 'primevue/tabpanel/TabPanel.vue'
import TabView from 'primevue/tabview/TabView.vue'

const route = useRoute()

const chartOptions = computed(() => ({
    animation: true,
    responsive: true,
    maintainAspectRatio: false
}))

const {
    data: survey,
    pending: loadingSurvey,
    refresh: refreshSurvey
} = useFetch('/api/telegram/survey/info', { query: { surveyId: route.params.surveyId } })
</script>
