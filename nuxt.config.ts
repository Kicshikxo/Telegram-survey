export default defineNuxtConfig({
    css: [
        'primevue/resources/themes/lara-light-blue/theme.css',
        'primevue/resources/primevue.css',
        'primeicons/primeicons.css',
        'primeflex/primeflex.css',

        'assets/css/main.css'
    ],

    modules: ['@nuxt/devtools'],

    vite: {
        resolve: {
            alias: { '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js' }
        }
    },

    build: {
        transpile: ['primevue']
    }
})
