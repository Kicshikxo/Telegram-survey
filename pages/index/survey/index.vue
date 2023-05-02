<template>
    <div class="card">
        <DataView :value="surveys ?? []" data-key="id" layout="grid">
            <template #header>
                <div class="flex justify-content-end gap-2">
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingSurveys" @click="() => refreshSurveys()" />
                    <Button label="Добавить" icon="pi pi-plus" severity="success" :disabled="loadingSurveys" @click="" />
                </div>
            </template>
            <template #grid="{ data }">
                <div class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                    <Card class="border-1 surface-border shadow-none">
                        <template #title>
                            <div class="flex justify-content-between align-items-center">
                                {{ data.title }}
                                <div class="flex justify-content-end flex-wrap gap-2">
                                    <Button
                                        label="Подробнее"
                                        icon="pi pi-ellipsis-v"
                                        iconPos="right"
                                        severity="secondary"
                                        text
                                        size="small"
                                        @click="router.push(`/survey/${data.id}`)"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #subtitle>
                            <Tag
                                v-if="data.status === SurveyStatus.NOT_STARTED"
                                severity="danger"
                                :value="`Статус: ${localizeSurveyStatus(data.status)}`"
                            />
                            <Tag
                                v-if="data.status === SurveyStatus.IN_PROGRESS"
                                severity="warning"
                                :value="`Статус: ${localizeSurveyStatus(data.status)}`"
                            />
                            <Tag
                                v-if="data.status === SurveyStatus.FINISHED"
                                severity="success"
                                :value="`Статус: ${localizeSurveyStatus(data.status)}`"
                            />
                        </template>
                        <template #content>
                            <div class="flex flex-column gap-2">
                                <InlineMessage severity="warn" icon="pi pi-info-circle" class="w-full justify-content-start">
                                    <span>Короткий идентификатор: </span>
                                    <span class="font-bold">{{ data.shortId }}</span>
                                </InlineMessage>
                                <InlineMessage severity="info" icon="pi pi-users" class="w-full justify-content-start">
                                    <span>Количество участников: </span>
                                    <span class="font-bold">{{ data.respondents.length }}</span>
                                </InlineMessage>
                                <Divider class="my-0" />
                                <InlineMessage
                                    v-for="question in data.questions"
                                    severity="info"
                                    icon="pi pi-question"
                                    class="w-full justify-content-start"
                                >
                                    <span>{{ (question as SurveyQuestion).title }}</span>
                                </InlineMessage>
                            </div>
                        </template>
                        <template #footer>
                            <div class="flex justify-content-end flex-wrap gap-2">
                                <Button
                                    v-if="data.status !== SurveyStatus.NOT_STARTED"
                                    label="Статистика"
                                    icon="pi pi-chart-pie"
                                    severity="secondary"
                                    @click="router.push(`/survey/${data.id}/statistics`)"
                                />
                                <Button
                                    v-if="data.status === SurveyStatus.NOT_STARTED"
                                    label="Начать"
                                    icon="pi pi-play"
                                    severity="success"
                                    @click="() => confirmStartSurvey(data.id)"
                                />
                                <Button
                                    v-if="data.status === SurveyStatus.IN_PROGRESS"
                                    label="Завершить"
                                    icon="pi pi-stop"
                                    severity="danger"
                                    @click="() => confirmFinishSurvey(data.id)"
                                />
                            </div>
                        </template>
                    </Card>
                </div>
            </template>
        </DataView>
    </div>
</template>

<script setup lang="ts">
import { SurveyQuestion, SurveyStatus } from '@prisma/client'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataView from 'primevue/dataview'
import Divider from 'primevue/divider/Divider.vue'
import InlineMessage from 'primevue/inlinemessage/InlineMessage.vue'
import Tag from 'primevue/tag/Tag.vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

function confirmStartSurvey(surveyId: string) {
    confirm.require({
        header: 'Подтверждение действия',
        message: 'Вы действительно хотите начать опрос?',
        icon: 'pi pi-question-circle',
        accept: () => {
            startSurvey(surveyId)
        }
    })
}

async function startSurvey(surveyId: string) {
    const { error } = await useFetch('/api/telegram/survey/start', { query: { surveyId } })
    if (error.value) {
        toast.add({ summary: 'Ошибка', detail: 'Не удалось запустить опрос', severity: 'error', life: 3000 })
        return
    }

    await refreshSurveys()
    toast.add({ summary: 'Успешно', detail: 'Опрос запущен', severity: 'success', life: 3000 })
}

function confirmFinishSurvey(surveyId: string) {
    confirm.require({
        header: 'Подтверждение действия',
        message: 'Вы действительно хотите завершить опрос?',
        icon: 'pi pi-question-circle',
        accept: () => {
            finishSurvey(surveyId)
        }
    })
}

async function finishSurvey(surveyId: string) {
    const { error } = await useFetch('/api/telegram/survey/finish', { query: { surveyId } })
    if (error.value) {
        toast.add({ summary: 'Ошибка', detail: 'Не удалось завершить опрос', severity: 'error', life: 3000 })
        return
    }

    await refreshSurveys()
    toast.add({ summary: 'Успешно', detail: 'Опрос завершён', severity: 'success', life: 3000 })
}

const { data: surveys, pending: loadingSurveys, refresh: refreshSurveys } = useFetch('/api/telegram/survey/list')
</script>
