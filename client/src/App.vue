<template>
  <div class="app-all">
    <GNav />
    <router-view></router-view>
    <GFooter />
    <GBg />
  </div>
</template>

<script lang="ts" setup>
import GNav from '@/components/GNav/index.vue'
import GFooter from '@/components/GFooter/index.vue'
import GBg from '@/components/GBg/index.vue'
</script>

<style lang="scss" scoped></style>