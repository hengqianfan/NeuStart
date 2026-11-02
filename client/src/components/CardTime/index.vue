<template>
    <span class="clock">{{ timeText }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const timeText = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const pad = (n: number): string => String(n).padStart(2, '0')

const update = (): void => {
    const d = new Date()
    timeText.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
    update()
    timer = setInterval(update, 1000)
})

onUnmounted(() => {
    if (timer !== null) {
        clearInterval(timer)
        timer = null
    }
})
</script>

<style scoped>
.clock {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1em;
}
</style>