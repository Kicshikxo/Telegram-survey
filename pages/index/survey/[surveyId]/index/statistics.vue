<template>
    <div>
        <TabView scrollable>
            <TabPanel v-for="question in survey?.questions" :header="`Вопрос №${question.index}: ${question.title}`">
                <div class="flex justify-content-between">
                    <div class="flex align-items-center gap-2">
                        <label for="auto-refresh-switch" class="font-bold">Автообновление</label>
                        <InputSwitch v-model="enableAutoRefresh" inputId="auto-refresh-switch" />
                    </div>
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
                            .sort((a, b) => b.answer.createdAt.localeCompare(a.answer.createdAt))
                    "
                    removableSort
                    class="p-datatable-lg"
                >
                    <Column field="answer.respondent.secondName" header="Фамилия" sortable />
                    <Column field="answer.respondent.firstName" header="Имя" sortable />
                    <Column field="answer.respondent.middleName" header="Отчество" sortable />
                    <Column field="option.value" header="Ответ" sortable />
                    <Column field="answer.createdAt" header="Время ответа" sortable>
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
import InputSwitch from 'primevue/inputswitch/InputSwitch.vue'
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

const enableAutoRefresh = ref(true)
const refreshSurveyInterval = setInterval(() => enableAutoRefresh.value && !loadingSurvey.value && refreshSurvey(), 1000)
onUnmounted(() => clearInterval(refreshSurveyInterval))
</script>
