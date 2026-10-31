<template>
    <nav class="nav-all" aria-label="快捷导航">

        <button v-for="item in navList" :key="item.icon" type="button" class="nav-item"
            :class="{ 'is-active': isActive(item) }" :title="item.label" :aria-label="item.label"
            :aria-current="isActive(item) ? 'page' : undefined" @click="handleClick(item)">
            <i :class="`iconfont icon-${item.icon}`" aria-hidden="true" />

        </button>
    </nav>
</template>

<script lang="ts" setup>

import { useRoute, useRouter } from 'vue-router'

interface NavItem {
    icon: string
    label: string
    /** 路由 name（优先使用） */
    name?: string
    /** 路由 path 或站外地址（无 name 时兜底） */
    path?: string
}

// 纯静态数据无需 ref，避免不必要的响应式开销
const navList: NavItem[] = [
    { icon: 'home', label: '首页', name: 'home', path: '/' },
    { icon: 'nav', label: '导航', name: 'sites', path: '/sites' },
    { icon: 'project', label: '项目', name: 'project', path: '/project' },
    { icon: 'bulb', label: '关于', name: 'about', path: '/about' }
]

const router = useRouter()
const route = useRoute()

/** 判断是否为当前激活项：name 优先，其次比较 path */
function isActive(item: NavItem): boolean {
    if (item.name && route.name === item.name) return true
    return !!item.path && route.path === item.path
}

function handleClick(item: NavItem) {
    // 1. 优先按路由 name 跳转
    if (item.name && router.hasRoute(item.name)) {
        if (route.name === item.name) return // 已在当前页，避免重复导航
        router.push({ name: item.name })
        return
    }

    // 2. 无对应路由：绝对地址则整页跳转
    if (!item.path) return
    if (/^https?:\/\//.test(item.path)) {
        window.open(item.path, '_blank', 'noopener,noreferrer')
        return
    }

    // 3. 兜底按 path 跳转
    if (route.path !== item.path) router.push(item.path)
}
</script>

<style lang="scss" scoped>
.nav-all {
    /* ===== 黑色主题变量，换色只改这里 ===== */
    --nav-width: 46px;
    --nav-radius: calc(var(--nav-width) / 2);
    --nav-pad: 10px;
    --nav-item-size: 30px;
    --nav-gap: 16px;

    /* 黑透玻璃 */
    --nav-bg: rgba(12, 12, 14, 0.42);
    --nav-border: rgba(255, 255, 255, 0.14);
    --nav-blur: 16px;
    --nav-shadow:
        0 6px 24px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);

    --nav-item-bg: rgba(255, 255, 255, 0.06);
    --nav-item-bg-hover: rgba(255, 255, 255, 0.16);
    --nav-item-bg-active: rgba(255, 255, 255, 0.24);

    /* 文字/图标色 */
    --nav-icon: rgba(255, 255, 255, 0.78);
    --nav-icon-active: #ffffff;

    /* 统一动效曲线：先快后缓，收尾自然 */
    --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
    --dur: 0.32s;

    position: fixed;
    z-index: 100;

    /* ---- 横屏 / 桌面：右侧垂直居中的竖条 ---- */
    right: 12px;
    top: 50%;
    left: auto;
    bottom: auto;
    transform: translateY(-50%);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--nav-gap);

    width: var(--nav-width);
    height: auto;
    box-sizing: border-box;
    padding: var(--nav-pad) 0;

    background: var(--nav-bg);
    -webkit-backdrop-filter: blur(var(--nav-blur)) saturate(120%);
    backdrop-filter: blur(var(--nav-blur)) saturate(120%);
    border: 1px solid var(--nav-border);
    border-radius: var(--nav-radius);
    box-shadow: var(--nav-shadow);
    overflow: hidden;

    /* 只过渡真正会变的属性 */
    transition:
        top var(--dur) var(--ease),
        left var(--dur) var(--ease),
        right var(--dur) var(--ease),
        width var(--dur) var(--ease),
        height var(--dur) var(--ease),
        padding var(--dur) var(--ease),
        border-radius var(--dur) var(--ease),
        box-shadow var(--dur) var(--ease),
        transform var(--dur) var(--ease);
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nav-item-size);
    height: var(--nav-item-size);
    flex: 0 0 auto;
    margin: 0;
    padding: 0;

    line-height: 1;
    color: var(--nav-icon);
    background: var(--nav-item-bg);
    border: none;
    appearance: none;
    border-radius: 50%;
    cursor: pointer;

    transition:
        background-color var(--dur) var(--ease),
        transform var(--dur) var(--ease),
        box-shadow var(--dur) var(--ease),
        color var(--dur) var(--ease);

    will-change: transform;
    backface-visibility: hidden;

    i {
        font-size: 16px;
        transition: transform var(--dur) var(--ease);
    }

    /* 当前路由高亮 */
    &.is-active {
        color: var(--nav-icon-active);
        background: var(--nav-item-bg-active);
        box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.22),
            0 4px 14px rgba(0, 0, 0, 0.5);
    }

    &:hover,
    &:focus-visible {
        color: var(--nav-icon-active);
        background: var(--nav-item-bg-hover);
        transform: scale(1.08);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);

        i {
            transform: scale(1.05);
        }
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
    }

    &:active {
        transform: scale(0.96);
    }
}

/* ===== 竖屏（手机竖向）：导航移到右上角，横向排列 ===== */
@media (orientation: portrait) {
    .nav-all {
        /* 定位：右上角 */
        top: 10px;
        right: 10px;
        left: auto;
        bottom: auto;
        /* 取消垂直居中偏移，避免动画时跳变 */
        transform: none;

        flex-direction: row;
        align-items: center;
        justify-content: center;

        /* 宽度自适应、高度与竖条宽度一致，形成胶囊 */
        width: auto;
        height: var(--nav-width);
        padding: 0 var(--nav-pad);

        border-radius: var(--nav-radius);
    }
}

/* 尊重系统「减少动效」偏好 */
@media (prefers-reduced-motion: reduce) {

    .nav-all,
    .nav-item,
    .nav-item i {
        transition: none;
    }
}
</style>