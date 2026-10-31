<template>
    <div class="bg" aria-hidden="true">
        <!-- 1. 兜底渐变：永远在最底，图片加载失败时它就是背景 -->
        <div class="bg__gradient" />

        <!-- 2. 图片层：叠在渐变之上，加载成功才淡入 -->
        <img v-if="!failed" ref="imgRef" class="bg__image" :class="{ 'is-loaded': loaded }" :src="IMG_SRC" alt=""
            decoding="async" fetchpriority="low" @load="onLoad" @error="onError" />

        <!-- 3. 网格：叠在图片之上，只提供轻微质感 -->
        <div class="bg__grid" />

        <!-- 4. 压暗：最上层，聚焦中心 -->
        <div class="bg__vignette" />
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const IMG_SRC =
    'https://cdn.jsdelivr.net/gh/hengqianfan/NVP-ImageHost@main/public/images/bgs/城市夜间.png'

const imgRef = ref<HTMLImageElement | null>(null)
const failed = ref(false)
const loaded = ref(false)

function onLoad() {
    loaded.value = true
}

function onError() {
    failed.value = true
    loaded.value = false
    console.warn('[GBg] 背景图加载失败:', IMG_SRC)
}

// 兜底：缓存命中时 load/error 可能早于监听绑定
watch(
    imgRef,
    (el) => {
        if (!el) return
        if (el.complete) {
            if (el.naturalWidth > 0) loaded.value = true
            else onError()
            return
        }
        el.addEventListener('load', onLoad, { once: true })
        el.addEventListener('error', onError, { once: true })
    },
    { flush: 'post', immediate: true },
)
</script>

<style lang="scss" scoped>
.bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: #08090b;
    /* 防白闪 */

    /* 层级常量：集中管理，避免再出现“谁盖谁”的意外 */
    --z-gradient: -3;
    --z-image: -2;
    --z-grid: -1;
    --z-vignette: 0;

    /* 图片透明度：单独抽出来方便调节 */
    --image-opacity: 0.55;

    --bg-top: #1a1d23;
    --bg-bottom: #08090b;
    --grid-line: rgba(255, 255, 255, 0.055);
    --grid-size: 44px;
    --grid-fade: 72%;
    --glow: rgba(255, 255, 255, 0.06);
}

/* 底色渐变：作为 fallback，位于最底层 */
.bg__gradient {
    position: absolute;
    inset: 0;
    z-index: var(--z-gradient);
    background:
        radial-gradient(1000px 520px at 50% -10%, var(--glow) 0%, transparent 65%),
        linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
}

/* 图片：位于渐变之上 */
.bg__image {
    position: absolute;
    inset: 0;
    z-index: var(--z-image);
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    transition: opacity 0.6s ease;
    will-change: opacity;

    &.is-loaded {
        opacity: var(--image-opacity);
    }
}

/* 网格：位于图片之上，透明度调低，避免糊住画面 */
.bg__grid {
    position: absolute;
    inset: 0;
    z-index: var(--z-grid);
    background-image:
        linear-gradient(var(--grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: var(--grid-size) var(--grid-size);
    mask-image: radial-gradient(circle at 50% 45%, #000 0%, transparent var(--grid-fade));
    -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 0%, transparent var(--grid-fade));
    opacity: 0.7;
    /* 网格本身再淡一点，图片才能透出来 */
}

/* 压暗：最上层 */
.bg__vignette {
    position: absolute;
    inset: 0;
    z-index: var(--z-vignette);
    background: radial-gradient(circle at 50% 45%,
            transparent 45%,
            rgba(0, 0, 0, 0.55) 100%);
}

@media (max-width: 480px) {
    .bg {
        --grid-size: 32px;
        --image-opacity: 0.5;
    }
}
</style>