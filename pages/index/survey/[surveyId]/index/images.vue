<template>
    <div class="card">
        <DataView :value="images ?? []" data-key="id" layout="grid">
            <template #header>
                <div class="flex justify-content-between">
                    <div class="flex align-items-center gap-2">
                        <label for="auto-refresh-switch">Автообновление</label>
                        <InputSwitch v-model="enableAutoRefresh" inputId="auto-refresh-switch" />
                    </div>
                    <Button label="Обновить" icon="pi pi-refresh" :loading="loadingImages" @click="() => refreshImages()" />
                </div>
            </template>
            <template #grid="{ data }">
                <div class="col-12 sm:col-6 md:col-4 lg:col-3 p-2">
                    <Card class="border-1 surface-border shadow-none">
                        <template #header>
                            <Image
                                :src="data.url"
                                :alt="data.prompt"
                                preview
                                imageClass="w-full h-full border-round"
                                imageStyle="object-fit: contain"
                            />
                        </template>
                        <template #title>
                            {{ data.respondent.secondName }} {{ data.respondent.firstName }} {{ data.respondent.middleName }}
                        </template>
                        <template #content>
                            Запрос: <span class="text-primary font-bold">{{ data.prompt }}</span>
                        </template>
                    </Card>
                </div>
            </template>
        </DataView>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataView from 'primevue/dataview'
import Image from 'primevue/image/Image.vue'
import InputSwitch from 'primevue/inputswitch/InputSwitch.vue'

const route = useRoute()

const {
    data: images,
    pending: loadingImages,
    refresh: refreshImages
} = useFetch('/api/telegram/survey/images/list', { query: { surveyId: route.params.surveyId } })

const enableAutoRefresh = ref(true)
const refreshImagesInterval = setInterval(() => enableAutoRefresh.value && !loadingImages.value && refreshImages(), 1000)
onUnmounted(() => clearInterval(refreshImagesInterval))
</script>
