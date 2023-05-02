export default defineNuxtConfig({
    app: {
        pageTransition: { name: 'page', mode: 'out-in' }
    },

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
