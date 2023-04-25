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
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Chart from 'primevue/chart/Chart.vue'
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
