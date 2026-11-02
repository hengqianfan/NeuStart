<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Site } from '@/types/site';

const props = defineProps<{ site: Site }>();

const ICON_BASE =
    'https://cdn.jsdelivr.net/gh/hengqianfan/NVP-ImageHost@main/public/images/icons/';
const MAX_TAGS = 3;

const iconFailed = ref(false);
const showFallback = computed(() => !props.site.icon || iconFailed.value);

const iconUrl = computed(() => {
    const icon = props.site.icon?.trim();
    if (!icon) return '';
    if (/^(https?:)?\/\//.test(icon) || icon.startsWith('data:')) return icon;
    return ICON_BASE + icon.replace(/^\/+/, '') + '.png';
});

const initial = computed(
    () => (props.site.name?.trim() ?? '').charAt(0).toUpperCase() || '?',
);

const fallbackStyle = computed(() => {
    const name = props.site.name ?? '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return {
        '--fb-bg': `hsl(${hue} 45% 22%)`,
        '--fb-fg': `hsl(${hue} 85% 72%)`,
    } as Record<string, string>;
});

const visibleTags = computed(() => props.site.tags?.slice(0, MAX_TAGS) ?? []);
const restCount = computed(() => Math.max(0, (props.site.tags?.length ?? 0) - MAX_TAGS));

const onIconError = () => {
    iconFailed.value = true;
};
watch(() => props.site.icon, () => {
    iconFailed.value = false;
});
</script>

<template>
    <a class="site-card" :href="site.link" target="_blank" rel="noopener noreferrer">
        <!-- 顶层流光：跟随鼠标的柔和高光 -->
        <span class="site-card__sheen" aria-hidden="true" />

        <header class="site-card__head">
            <span class="site-card__icon-wrap">
                <img v-if="!showFallback" class="site-card__icon" :src="iconUrl" :alt="site.name" loading="lazy"
                    decoding="async" @error="onIconError" />
                <span v-else class="site-card__icon site-card__icon--fallback" :style="fallbackStyle"
                    aria-hidden="true">{{ initial }}</span>
            </span>

            <h3 class="site-card__name" :title="site.name">{{ site.name }}</h3>

            <span class="site-card__go" aria-hidden="true">前往网址</span>
        </header>

        <p class="site-card__desc" :title="site.desc">{{ site.desc || '—' }}</p>

        <footer v-if="site.tags?.length" class="site-card__tags">
            <span v-for="t in visibleTags" :key="t" class="site-card__tag">{{ t }}</span>
            <span v-if="restCount > 0" class="site-card__tag site-card__tag--more">+{{ restCount }}</span>
        </footer>
    </a>
</template>

<style scoped>
.site-card {
    --card-bg-1: #171922;
    --card-bg-2: #14161d;
    --card-bg-hover-1: #1d212c;
    --card-bg-hover-2: #181b24;
    --card-title: #eaecf2;
    --card-text: #8d95a9;
    --card-tag-bg: rgba(255, 255, 255, 0.055);
    --card-tag-text: #9ba4b9;
    --card-accent: #8b9dff;

    position: relative;
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 13px 14px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 18px;
    background:
        linear-gradient(var(--card-bg-1), var(--card-bg-2)) padding-box,
        linear-gradient(140deg,
            rgba(255, 255, 255, 0.10),
            rgba(139, 157, 255, 0.14) 38%,
            rgba(255, 255, 255, 0.03) 72%) border-box;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    isolation: isolate;
    transform: translateZ(0);
    transition:
        transform 0.24s cubic-bezier(0.22, 0.61, 0.36, 1),
        background 0.24s ease,
        box-shadow 0.24s ease;
}

/* 顶部一条细微高光，模拟玻璃边缘 */
.site-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent);
    opacity: 0.7;
    pointer-events: none;
}

/* 斜向流光，hover 时扫过 */
.site-card__sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.07) 45%,
            transparent 62%);
    transform: translateX(-120%);
    transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.site-card:hover .site-card__sheen {
    transform: translateX(120%);
}

.site-card:hover {
    background:
        linear-gradient(var(--card-bg-hover-1), var(--card-bg-hover-2)) padding-box,
        linear-gradient(140deg,
            rgba(139, 157, 255, 0.55),
            rgba(139, 157, 255, 0.22) 42%,
            rgba(255, 255, 255, 0.06) 78%) border-box;
    box-shadow:
        0 14px 30px -12px rgba(0, 0, 0, 0.65),
        0 0 0 1px rgba(139, 157, 255, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
}

.site-card:active {
    transform: translateY(0) scale(0.995);
}

.site-card:focus-visible {
    outline: 2px solid var(--card-accent);
    outline-offset: 2px;
}

.site-card__head {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
}

/* 图标容器：默认白底 + 外圈细边 */
.site-card__icon-wrap {
    position: relative;
    flex: none;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.10),
        0 2px 6px -2px rgba(0, 0, 0, 0.6);
    transition: background 0.22s ease, border-color 0.22s ease,
        box-shadow 0.22s ease, transform 0.22s ease;
}

.site-card:hover .site-card__icon-wrap {
    /* background: radial-gradient(circle at 50% 20%, #2a2f3d, #1e2230);
     */
    background-color: rgb(28, 112, 190);
    border-color: rgba(139, 157, 255, 0.42);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        0 0 0 3px rgba(139, 157, 255, 0.10),
        0 4px 12px -4px rgba(0, 0, 0, 0.7);
    transform: scale(1.04);
}

.site-card__icon {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 50%;
    object-fit: contain;
    display: block;
}

img.site-card__icon {
    padding: 4px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.22));
    transition: filter 0.22s ease;
}

.site-card:hover img.site-card__icon {
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55));
}

/* 兜底字母：仍用彩色底，不受白底影响 */
.site-card__icon--fallback {
    display: grid;
    place-items: center;
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.5px;
    user-select: none;
    background: linear-gradient(160deg,
            color-mix(in srgb, var(--fb-bg, #232733) 100%, #fff 8%),
            var(--fb-bg, #232733));
    color: var(--fb-fg, #8b9dff);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.site-card__name {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: 0.1px;
    color: var(--card-title);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s ease;
}

.site-card:hover .site-card__name {
    color: #fff;
}

/* hover 提示文字 */
.site-card__go {
    flex: none;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: var(--card-accent);
    white-space: nowrap;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.site-card:hover .site-card__go,
.site-card:focus-visible .site-card__go {
    opacity: 1;
    transform: translateY(0);
}

.site-card__desc {
    margin: 0;
    position: relative;
    z-index: 1;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--card-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(12.5px * 1.6 * 2);
    transition: color 0.2s ease;
}

.site-card:hover .site-card__desc {
    color: #a6aec2;
}

.site-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
    position: relative;
    z-index: 1;
}

.site-card__tag {
    font-size: 11px;
    line-height: 1;
    padding: 4.5px 8px;
    border-radius: 999px;
    background: var(--card-tag-bg);
    color: var(--card-tag-text);
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.site-card:hover .site-card__tag {
    color: #aab3c8;
    background: rgba(255, 255, 255, 0.075);
    border-color: rgba(139, 157, 255, 0.20);
}

.site-card__tag--more {
    background: rgba(139, 157, 255, 0.10);
    color: var(--card-accent);
    font-weight: 600;
    border-color: rgba(139, 157, 255, 0.22);
}

.site-card:hover .site-card__tag--more {
    background: rgba(139, 157, 255, 0.18);
    border-color: rgba(139, 157, 255, 0.38);
    color: #a3b2ff;
}

@media (prefers-reduced-motion: reduce) {

    .site-card,
    .site-card__sheen,
    .site-card__icon-wrap,
    .site-card__icon,
    .site-card__go,
    .site-card__tag,
    .site-card__desc {
        transition: none !important;
    }

    .site-card:hover {
        transform: none;
    }

    .site-card__sheen {
        display: none;
    }
}
</style>