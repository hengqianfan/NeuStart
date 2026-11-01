<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Project } from '@/types/project'
import { projects } from '@/config/projects'

/* ============================================================
   数据结构（写死样例，后期替换即可）
   ============================================================ */


const ICON_BASE =
    'https://cdn.jsdelivr.net/gh/hengqianfan/NVP-ImageHost@main/public/images/icons/'

const MAX_TAGS = 3


/* ============================================================
   状态样式
   ============================================================ */
const STATUS_MAP: Record<
    NonNullable<Project['status']>,
    { text: string; color: string; dot: string }
> = {
    active: { text: '运行中', color: '#57d9a3', dot: '#57d9a3' },
    wip: { text: '开发中', color: '#8b9dff', dot: '#8b9dff' },
    paused: { text: '已暂停', color: '#ffcc66', dot: '#ffcc66' },
    archived: { text: '已归档', color: '#8b93a7', dot: '#8b93a7' },
}

/* ============================================================
   卡片工具
   ============================================================ */
const failedIcons = ref<Record<string, boolean>>({})

const resolveIcon = (icon?: string) => {
    const v = icon?.trim()
    if (!v) return ''
    if (/^(https?:)?\/\//.test(v) || v.startsWith('data:')) return v
    return ICON_BASE + v.replace(/^\/+/, '') + '.png'
}

const onIconError = (name: string) => {
    failedIcons.value = { ...failedIcons.value, [name]: true }
}

const showFallback = (p: Project) => !p.icon || !!failedIcons.value[p.name]

const initial = (name: string) => (name?.trim() ?? '').charAt(0).toUpperCase() || '?'

const hashStyle = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    const hue = Math.abs(hash) % 360
    return {
        '--fb-bg': `hsl(${hue} 42% 24%)`,
        '--fb-fg': `hsl(${hue} 88% 76%)`,
    } as Record<string, string>
}

const visibleTags = (p: Project) => p.tags?.slice(0, MAX_TAGS) ?? []
const restCount = (p: Project) => Math.max(0, (p.tags?.length ?? 0) - MAX_TAGS)

/** 置顶优先 */
const sortedProjects = computed(() =>
    [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
)
</script>

<template>
    <div class="pj">
        <!-- ============ 头部 ============ -->
        <header class="pj-hero">
            <div class="pj-hero__main">
                <p class="pj-hero__eyebrow">PORTFOLIO</p>
                <h1 class="pj-hero__title">项目集</h1>
                <p class="pj-hero__sub">
                    一些长期维护与探索中的作品，涵盖前端组件、工具链与自动化方案。
                </p>
            </div>

            <div class="pj-hero__stats">
                <span class="pj-stat">
                    <b>{{ sortedProjects.length }}</b>
                    <i>项目总数</i>
                </span>
                <span class="pj-stat">
                    <b>{{sortedProjects.filter((p) => p.status === 'active').length}}</b>
                    <i>进行中</i>
                </span>
            </div>
        </header>

        <!-- ============ 列表 ============ -->
        <main class="pj-main">
            <div class="pj-list">
                <a v-for="(p, i) in sortedProjects" :key="p.name" class="pj-card" :href="p.link" target="_blank"
                    rel="noopener noreferrer">
                    <!-- 序号水印 -->
                    <span class="pj-card__index" aria-hidden="true">
                        {{ String(i + 1).padStart(2, '0') }}
                    </span>

                    <!-- 左：方形图标，撑满卡片高度 -->
                    <span class="pj-card__icon-wrap">
                        <img v-if="!showFallback(p)" class="pj-card__icon" :src="resolveIcon(p.icon)" :alt="p.name"
                            loading="lazy" decoding="async" @error="onIconError(p.name)" />
                        <span v-else class="pj-card__icon pj-card__icon--fallback" :style="hashStyle(p.name)"
                            aria-hidden="true">
                            {{ initial(p.name) }}
                        </span>
                    </span>

                    <!-- 右：标题 / 简介 / 标签 -->
                    <div class="pj-card__body">
                        <div class="pj-card__row">
                            <h2 class="pj-card__name" :title="p.name">{{ p.name }}</h2>

                            <span v-if="p.featured" class="pj-card__pin" aria-label="置顶">
                                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                                    <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"
                                        fill="currentColor" />
                                </svg>
                            </span>

                            <span v-if="p.status" class="pj-card__status"
                                :style="{ color: STATUS_MAP[p.status].color }">
                                <i class="pj-card__status-dot" :style="{ background: STATUS_MAP[p.status].dot }" />
                                {{ STATUS_MAP[p.status].text }}
                            </span>
                        </div>

                        <p class="pj-card__desc" :title="p.desc">{{ p.desc || '—' }}</p>

                        <div v-if="p.tags?.length" class="pj-card__tags">
                            <span v-for="t in visibleTags(p)" :key="t" class="pj-card__tag">{{ t }}</span>
                            <span v-if="restCount(p) > 0" class="pj-card__tag pj-card__tag--more">
                                +{{ restCount(p) }}
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* ================= 设计变量 ================= */
.pj {
    --bg-card: #14161d;
    --bg-card-hover: #191c25;
    --line: rgba(255, 255, 255, 0.07);
    --line-strong: rgba(255, 255, 255, 0.14);
    --title: #eef0f6;
    --text: #858da1;
    --text-dim: #5c6377;
    --accent: #8b9dff;
    --accent-soft: rgba(139, 157, 255, 0.14);

    box-sizing: border-box;
    min-height: 100vh;
    padding: 60px 80px;
    color: var(--title);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
    z-index: 1;
}

/* ================= 头部 ================= */
.pj-hero {
    max-width: 1360px;
    margin: 0 auto 40px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    flex-wrap: wrap;
}

.pj-hero__eyebrow {
    margin: 0 0 10px;
    font-size: 11px;
    letter-spacing: 0.22em;
    font-weight: 600;
    color: var(--accent);
    opacity: 0.85;
}

.pj-hero__title {
    margin: 0;
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
    background: linear-gradient(180deg, #ffffff 0%, #b9c0d4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.pj-hero__sub {
    margin: 12px 0 0;
    max-width: 46ch;
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
}

.pj-hero__stats {
    display: flex;
    gap: 10px;
}

.pj-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 92px;
    padding: 12px 16px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.pj-stat b {
    font-size: 20px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
}

.pj-stat i {
    font-style: normal;
    font-size: 11px;
    color: var(--text-dim);
}

/* ================= 列表 ================= */
.pj-main {
    max-width: 1360px;
    margin: 0 auto;
}

.pj-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
}

@media (min-width: 1180px) {
    .pj-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
    }
}

@media (min-width: 1640px) {
    .pj-list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

/* ================= 卡片 ================= */
.pj-card {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: 16px;
    padding: 18px;
    box-sizing: border-box;
    border-radius: 18px;
    background: var(--bg-card);
    border: 1px solid var(--line);
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    isolation: isolate;
    transition:
        background 0.22s ease,
        border-color 0.22s ease,
        transform 0.22s cubic-bezier(0.22, 0.61, 0.36, 1),
        box-shadow 0.22s ease;
}

/* 顶部高光线 */
.pj-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent);
    opacity: 0;
    transition: opacity 0.22s ease;
}

/* 悬停柔光 */
.pj-card::after {
    content: '';
    position: absolute;
    top: -90px;
    right: -90px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--accent-soft), transparent 68%);
    opacity: 0;
    transition: opacity 0.28s ease;
    pointer-events: none;
    z-index: -1;
}

.pj-card:hover {
    background: var(--bg-card-hover);
    border-color: var(--line-strong);
    transform: translateY(-2px);
    box-shadow: 0 16px 40px -18px rgba(0, 0, 0, 0.85);
}

.pj-card:hover::before,
.pj-card:hover::after {
    opacity: 1;
}

.pj-card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}

/* 序号水印 */
.pj-card__index {
    position: absolute;
    right: 16px;
    bottom: 8px;
    font-size: 46px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #ffffff;
    opacity: 0.035;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.22s ease;
}

.pj-card:hover .pj-card__index {
    opacity: 0.07;
}

/* ---------- 左：方形图标，高度跟随卡片 ---------- */
.pj-card__icon-wrap {
    position: relative;
    flex: none;
    align-self: stretch;
    aspect-ratio: 1 / 1;
    min-width: 56px;
    min-height: 56px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    background: #1c1f29;
    overflow: hidden;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.07),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    transition: box-shadow 0.22s ease;
}

.pj-card:hover .pj-card__icon-wrap {
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(139, 157, 255, 0.3),
        0 0 22px -6px rgba(139, 157, 255, 0.5);
}

.pj-card__icon {
    width: 100%;
    height: 100%;
    max-height: 100px;
    box-sizing: border-box;
    border-radius: 16px;
    object-fit: contain;
    display: block;


}

img.pj-card__icon {
    padding: 10%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    transition: filter 0.22s ease;

}

.pj-card:hover img.pj-card__icon {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.55));
}

/* 兜底首字母 */
.pj-card__icon--fallback {
    display: grid;
    place-items: center;
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    user-select: none;
    background: var(--fb-bg, #232733);
    color: var(--fb-fg, #8b9dff);
}

/* ---------- 右：内容 ---------- */
.pj-card__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
}

.pj-card__row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.pj-card__name {
    margin: 0;
    flex: 1 1 auto;
    min-width: 0;
    font-size: 15.5px;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--title);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pj-card__pin {
    flex: none;
    display: grid;
    place-items: center;
    color: #ffcc66;
    opacity: 0.9;
}

.pj-card__status {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px 3px 8px;
    font-size: 11px;
    line-height: 1.4;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--line);
    white-space: nowrap;
}

.pj-card__status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    box-shadow: 0 0 0 3px currentColor;
    opacity: 0.85;
    transform: scale(0.7);
}

/* 已删除 .pj-card__arrow 相关样式 */

.pj-card__desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(13px * 1.6 * 2);
}

/* ---------- 标签 ---------- */
.pj-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.pj-card__tag {
    font-size: 11px;
    line-height: 1;
    padding: 5px 9px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.045);
    color: var(--text);
    white-space: nowrap;
    border: 1px solid transparent;
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.pj-card:hover .pj-card__tag {
    color: #c3c9da;
    background: rgba(139, 157, 255, 0.09);
    border-color: rgba(139, 157, 255, 0.16);
}

.pj-card__tag--more {
    background: transparent;
    color: var(--accent);
    font-weight: 600;
}

/* ================= 响应式 ================= */
@media (max-width: 1024px) {
    .pj {
        padding: 48px 22px 72px;
    }

    .pj-hero {
        margin-bottom: 30px;
    }
}

@media (max-width: 720px) {
    .pj {
        padding: 32px 14px 56px;
    }

    .pj-hero {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }

    .pj-hero__stats {
        width: 100%;
    }

    .pj-stat {
        flex: 1;
    }

    .pj-list {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .pj-card {
        padding: 14px;
        gap: 13px;
        border-radius: 16px;
    }

    .pj-card__icon-wrap {
        align-self: flex-start;
        min-width: 52px;
        min-height: 52px;
        width: 52px;
        height: 52px;
        aspect-ratio: auto;
        border-radius: 14px;
    }

    .pj-card__icon {
        border-radius: 14px;
    }

    .pj-card__icon--fallback {
        font-size: 22px;
    }

    .pj-card__index {
        font-size: 38px;
    }
}

/* ================= 动效降级 ================= */
@media (prefers-reduced-motion: reduce) {

    .pj-card,
    .pj-card::before,
    .pj-card::after,
    .pj-card__icon-wrap,
    .pj-card__icon,
    .pj-card__index,
    .pj-card__tag {
        transition: none;
    }

    .pj-card:hover {
        transform: none;
    }
}
</style>