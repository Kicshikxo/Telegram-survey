<template>
    <main>
        <ConfirmDialog />
        <Toast />
        <slot />
    </main>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
</script>
