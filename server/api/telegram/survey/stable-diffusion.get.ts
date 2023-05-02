import { ConfigType } from "@prisma/client"

export interface StableDuffisionResponse {
    id: number
    status: 'success' | 'processing' | 'failed' | 'error'
    eta?: number
    fetch_result?: string
    generationTime?: string
    output: string[]
    messege?: string
    tip?: string
    meta: {
        H: number
        W: number
        enable_attention_slicing: string
        file_prefix: string
        guidance_scale: number
        model: string
        n_samples: number
        negative_prompt: string
        outdir: string
        prompt: string
        revision: string
        safetychecker: string
        seed: number
        steps: number
        vae: string
    }
}

export default defineEventHandler(async event => {
    const query = getQuery(event) as { surveyId: string, prompt: string }
    if (!query.surveyId || !query.prompt) return sendError(event, createError({ statusCode: 400, statusMessage: 'surveyId or prompt is not provided' }))


    const survey = await prisma.survey.findUnique({ where: { id: query.surveyId }, include: { user: { include: { configs: true } } } })
    if (!survey) return

    const stableDiffusionApiKey = survey.user.configs.find(config => config.type === ConfigType.STABLE_DIFFUSION_API_KEY)?.value
    if (!stableDiffusionApiKey) return

    const yandexTranslatorApiKey = survey.user.configs.find(config => config.type === ConfigType.YANDEX_TRANSLATOR_API_KEY)?.value
    if (!stableDiffusionApiKey) return

    const translatedPrompt = await $fetch<{ translations: { text: string, detectedLanguageCode: string }[] }>('https://translate.api.cloud.yandex.net/translate/v2/translate', {
        method: 'POST',
        headers: { "Authorization": `Api-Key ${yandexTranslatorApiKey}` },
        body: {
            targetLanguageCode: 'en',
            texts: [query.prompt]
        }
    })

    console.log(translatedPrompt)

    let response = await $fetch<StableDuffisionResponse>('https://stablediffusionapi.com/api/v3/text2img', {
        method: 'POST',
        body: {
            key: stableDiffusionApiKey,
            prompt: translatedPrompt.translations.at(0)?.text,
            width: '512',
            height: '512',
            samples: '1'
        }
    })

    console.log(response)

    if (response.status === 'processing') {
        const fetchResultLink = response.fetch_result!
        while (response.status === 'processing') {
            response = await $fetch<StableDuffisionResponse>(fetchResultLink, {
                method: 'POST',
                body: { key: stableDiffusionApiKey, }
            })
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    return response
})
