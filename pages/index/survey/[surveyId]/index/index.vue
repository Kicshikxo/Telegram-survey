<template>
    <div class="p-3">
        <Fieldset v-if="editableSurvey" class="survey-fieldset">
            <template #legend>
                <div class="flex align-items-center gap-3">
                    <InputText
                        v-model.trim="editableSurvey.title"
                        placeholder="Название опроса"
                        :disabled="!editMode"
                        :style="{ cursor: editMode ? 'auto' : 'not-allowed' }"
                        class="w-full"
                    />
                    <div class="flex gap-2">
                        <Button
                            v-if="!editMode"
                            label="Обновить"
                            icon="pi pi-refresh"
                            :loading="loadingSurvey"
                            @click="() => refreshSurvey()"
                        />
                        <Button
                            v-if="!editMode && survey?.status === SurveyStatus.IN_DEVELOPMENT"
                            label="Редактировать"
                            icon="pi pi-pencil"
                            :disabled="loadingSurvey"
                            @click="startEditing"
                        />
                        <Button
                            v-if="editMode"
                            label="Отменить"
                            icon="pi pi-times"
                            severity="danger"
                            :disabled="loadingSurvey"
                            @click="cancelChanges"
                        />
                        <Button
                            v-if="editMode"
                            label="Сохранить"
                            icon="pi pi-save"
                            severity="success"
                            :loading="loadingSurvey"
                            :disabled="!hasChanges"
                            @click="confirmSaveChanges"
                        />
                    </div>
                </div>
            </template>
            <SlickList
                lockAxis="y"
                v-model:list="editableSurvey.questions"
                appendTo=".survey-fieldset"
                useDragHandle
                :shouldCancelStart="() => !editMode"
            >
                <SlickItem v-for="(question, index) in editableSurvey.questions" :key="question.id" :index="index" class="my-2">
                    <Fieldset>
                        <template #legend>
                            <div class="flex align-items-center gap-3 text-primary">
                                <DragHandle v-if="editMode" :class="{ 'drag-handle-y': editMode }">
                                    <i class="pi pi-bars" />
                                </DragHandle>
                                <span class="text-lg">
                                    {{ question.index }}
                                </span>
                                <InputText
                                    v-model.trim="question.title"
                                    :placeholder="`Заголовок вопроса №${question.index}`"
                                    :disabled="!editMode"
                                    :style="{ cursor: editMode ? 'auto' : 'not-allowed' }"
                                    class="w-full text-primary"
                                />
                                <div v-if="editMode" class="flex gap-2">
                                    <!-- <Button icon="pi pi-copy" severity="secondary" outlined /> -->
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        outlined
                                        @click="confirmDeleteQuestion(question.id)"
                                    />
                                </div>
                            </div>
                        </template>
                        <SlickList
                            lockAxis="y"
                            v-model:list="question.options"
                            appendTo=".survey-fieldset"
                            useDragHandle
                            :shouldCancelStart="() => !editMode"
                        >
                            <SlickItem
                                v-for="(option, index) in question.options"
                                :key="option.id"
                                :index="index"
                                class="flex align-items-center my-2"
                            >
                                <DragHandle v-if="editMode" :class="{ 'drag-handle-y': editMode }">
                                    <i class="pi pi-bars mr-3" />
                                </DragHandle>
                                <InputText
                                    v-model.trim="option.value"
                                    :placeholder="`Текст варианта ответа №${index + 1}`"
                                    :disabled="!editMode"
                                    :style="{ cursor: editMode ? 'auto' : 'not-allowed' }"
                                    class="w-full"
                                />
                                <Button
                                    v-if="editMode"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    class="ml-3"
                                    @click="confirmDeleteOption(question.id, option.id)"
                                />
                            </SlickItem>
                        </SlickList>
                        <Button v-if="editMode" icon="pi pi-plus" text class="w-full" @click="createOption(question.id)" />
                    </Fieldset>
                </SlickItem>
            </SlickList>
            <Button v-if="editMode" icon="pi pi-plus" text class="w-full" @click="createQuestion" />
        </Fieldset>
    </div>
</template>

<script setup lang="ts">
import { SurveyStatus } from '@prisma/client'
import Button from 'primevue/button/Button.vue'
import Fieldset from 'primevue/fieldset/Fieldset.vue'
import InputText from 'primevue/inputtext/InputText.vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'

const route = useRoute()
const confirm = useConfirm()
const toast = useToast()

const editMode = ref(false)
const loading = ref(false) // !!!!!!!!!!!!

async function startEditing() {
    editMode.value = true
}

async function cancelChanges() {
    editMode.value = false

    await refreshSurvey()
}

async function createQuestion() {
    if (!editableSurvey.value) return

    editableSurvey.value.questions.push({
        id: crypto.randomUUID(),
        surveyId: editableSurvey.value.id,
        index: editableSurvey.value.questions.length + 1,
        title: '',
        options: [],
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
    })
}

async function confirmDeleteQuestion(questionId: string) {
    confirm.require({
        header: 'Подтверждение действия',
        message: 'Вы действительно хотите удалить вопрос?',
        icon: 'pi pi-question-circle',
        accept: () => {
            deleteQuestion(questionId)
        }
    })
}

async function deleteQuestion(questionId: string) {
    if (!editableSurvey.value) return

    editableSurvey.value.questions = editableSurvey.value.questions.filter((question) => question.id !== questionId)
}

async function createOption(questionId: string) {
    if (!editableSurvey.value) return

    editableSurvey.value.questions
        .find((question) => question.id === questionId)
        ?.options.push({
            id: crypto.randomUUID(),
            questionId: editableSurvey.value.questions.find((question) => question.id === questionId)!.id,
            value: '',
            answers: []
        })
}

async function confirmDeleteOption(questionId: string, optionId: string) {
    confirm.require({
        header: 'Подтверждение действия',
        message: 'Вы действительно хотите удалить вариант ответа?',
        icon: 'pi pi-question-circle',
        accept: () => {
            deleteOption(questionId, optionId)
        }
    })
}

async function deleteOption(questionId: string, optionId: string) {
    if (!editableSurvey.value) return

    editableSurvey.value.questions = editableSurvey.value.questions.map((question) => ({
        ...question,
        options: question.options.filter((option) => option.id !== optionId)
    }))
}

async function confirmSaveChanges() {
    confirm.require({
        header: 'Подтверждение действия',
        message: 'Вы действительно хотите сохранить опрос?',
        icon: 'pi pi-question-circle',
        accept: () => {
            saveChanges()
        }
    })
}

async function saveChanges() {
    const { error } = await useFetch('/api/telegram/survey/update', {
        method: 'POST',
        body: {
            id: editableSurvey.value?.id,
            title: editableSurvey.value?.title,
            questions: editableSurvey.value?.questions.map((question) => ({
                id: question.id,
                index: question.index,
                title: question.title,
                options: question.options.map((option) => ({
                    id: option.id,
                    value: option.value
                }))
            }))
        } as {
            id: string
            title: string
            questions: {
                id: string
                title: string
                index: number
                options: {
                    id: string
                    value: string
                }[]
            }[]
        }
    })

    if (error.value)
        toast.add({
            severity: 'error',
            summary: 'Ошибка сохранения',
            detail: 'Изменения не были сохранены',
            life: 3000
        })
    else
        toast.add({
            severity: 'success',
            summary: 'Данные сохранены',
            detail: 'Изменения были сохранены',
            life: 3000
        })

    await refreshSurvey()
    editMode.value = false
}

const {
    data: survey,
    pending: loadingSurvey,
    refresh: refreshSurvey
} = useFetch('/api/telegram/survey/info', { query: { surveyId: route.params.surveyId } })

const editableSurvey = ref(structuredClone(toRaw(survey.value)))
const hasChanges = computed(() => JSON.stringify(editableSurvey.value) !== JSON.stringify(survey.value))
watch(survey, (value) => (editableSurvey.value = structuredClone(toRaw(value))), { flush: 'sync' })
watchEffect(() => {
    if (!editableSurvey.value) return
    editableSurvey.value!.questions = editableSurvey.value!.questions.map((question, index) => ({
        ...question,
        index: index + 1
    }))
})
</script>

<style>
.survey-fieldset input.p-disabled,
.survey-fieldset input.p-component:disabled {
    opacity: 100%;
}
.survey-fieldset .p-fieldset-legend {
    width: 100%;
}

.drag-handle-y {
    cursor: ns-resize;
}
</style>
