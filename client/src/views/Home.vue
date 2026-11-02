<template>
    <main class="profile">

        <!-- 翻转舞台 -->
        <div class="stage" :class="{ 'is-flipped': flipped }">

            <div class="flipper">
                <!-- ===== 正面：个人介绍 ===== -->
                <section class="card card--front" role="region" aria-label="个人介绍"
                    :aria-hidden="flipped ? 'true' : 'false'">
                    <div class="avatar">
                        <span class="avatar__ring" aria-hidden="true" />
                        <img class="avatar__img" src="/头像.png" alt="头像" />
                        <span class="avatar__shine" aria-hidden="true" />
                        <span class="avatar__glow" aria-hidden="true" />
                        <span class="avatar__status" aria-hidden="true" />
                    </div>

                    <h1 class="name">{{ myConfig.author }}</h1>

                    <ul class="tags" aria-label="技能标签">
                        <li v-for="tag in tags" :key="tag" class="tag">{{ tag }}</li>
                    </ul>

                    <p class="desc">
                        {{ myConfig.intro }}
                    </p>

                    <!-- 搜索 -->
                    <div class="card__search">
                        <SearchBox />
                    </div>

                    <!-- 右下角角标：唯一可点击的翻转触发器 -->
                    <button type="button" class="corner" :aria-pressed="flipped" aria-label="查看社交链接"
                        :tabindex="flipped ? -1 : 0" @click="toggleFlip">
                        <span class="corner__text">前往我的宇宙</span>
                    </button>
                </section>

                <!-- ===== 背面：社交链接卡片 ===== -->
                <section class="card card--back" role="region" aria-label="社交链接"
                    :aria-hidden="flipped ? 'false' : 'true'">
                    <h2 class="social__title">我的世界</h2>

                    <ul class="social__list">
                        <li v-for="item in myConfig.socials" :key="item.href" class="social__item">
                            <a class="social__link" :href="item.href" :aria-label="item.label"
                                :tabindex="flipped ? 0 : -1" target="_blank" rel="noopener noreferrer">
                                <span class="social__icon">
                                    <i :class="`iconfont icon-${item.icon}`" aria-hidden="true" />
                                </span>
                                <span class="social__meta">
                                    <span class="social__name">{{ item.label }}</span>
                                    <span class="social__sub">{{ item.sub }}</span>
                                </span>
                                <span class="social__arrow" aria-hidden="true">↗</span>
                            </a>
                        </li>
                    </ul>

                    <!-- 背面角标：点击翻回主页 -->
                    <button type="button" class="corner" :aria-pressed="flipped" aria-label="返回主页"
                        :tabindex="flipped ? 0 : -1" @click="toggleFlip">
                        <span class="corner__text">返回资料</span>
                    </button>
                </section>
            </div>
        </div>
    </main>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { myConfig } from '@/config'
import SearchBox from '@/components/Search/index.vue'

const tags = ['技术爱好者', '流浪型宅男']

const flipped = ref(false)

function toggleFlip() {
    flipped.value = !flipped.value
}
</script>

<style lang="scss" scoped>
/* ===== 主题变量（黑透） ===== */
.profile {
    --c-text: #e8eefc;
    --c-text-dim: #9aa4b4;
    --c-line: rgba(255, 255, 255, 0.06);

    /* 黑透玻璃：低不透明度 + 深色底 */
    --c-card: rgba(10, 12, 16, 0.6);
    --c-border: rgba(255, 255, 255, 0.14);
    --c-border-strong: rgba(255, 255, 255, 0.4);

    --radius: 20px;
    --shadow-card:
        0 24px 60px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);

    --avatar-size: 96px;
    --avatar-shift: calc(var(--avatar-size) / 2 + 12px);
    --flip-duration: 0.75s;

    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 100vh;
    min-height: 100dvh;
    padding: 24px;
    box-sizing: border-box;
    overflow: hidden;

    /* 背景由全局背景组件提供，此处保持透明 */
    background: transparent;
    color: var(--c-text);
    font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', sans-serif;
}

/* ===== 翻转舞台 ===== */
.stage {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 620px;
    perspective: 1600px;


    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.flipper {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform var(--flip-duration) cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;

}

.stage.is-flipped .flipper {
    transform: rotateY(180deg);
}

/* ===== 卡片通用：黑透玻璃 ===== */
.card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    width: 100%;
    box-sizing: border-box;

    background: var(--c-card);
    backdrop-filter: blur(16px);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-card);

    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
}

.card--front {
    padding: calc(var(--avatar-shift) + 18px) 32px 34px;
}

.card--back {
    position: absolute;
    inset: 0;
    justify-content: center;
    padding: 28px 24px 24px;
    transform: rotateY(180deg);
}

/* ===== 右下角角标 ===== */
.corner {
    position: absolute;
    right: 14px;
    bottom: 12px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 11px;
    font-family: inherit;
    line-height: 1;
    letter-spacing: 0.5px;

    color: rgba(255, 255, 255, 0.72);
    white-space: nowrap;
    cursor: pointer;

    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);

    opacity: 0.8;
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease,
        border-color 0.2s ease;

    &:hover,
    &:focus-visible {
        opacity: 1;
        transform: translateY(-2px);
        color: #fff;
        background: rgba(255, 255, 255, 0.16);
        border-color: var(--c-border-strong);
        outline: none;
    }

    &:active {
        transform: translateY(0);
    }
}

/* ===== 头像 ===== */
.avatar {
    position: absolute;
    top: calc(var(--avatar-shift) * -1);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;

    width: var(--avatar-size);
    height: var(--avatar-size);
}

/* 头像环：60s 一圈，缓慢匀速转动 */
.avatar__ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: conic-gradient(from 0deg,
            rgba(255, 255, 255, 0.7) 0deg,
            rgba(255, 255, 255, 0.16) 70deg,
            rgba(255, 255, 255, 0.28) 140deg,
            rgba(255, 255, 255, 0.7) 210deg,
            rgba(255, 255, 255, 0.16) 280deg,
            rgba(255, 255, 255, 0.7) 360deg);
    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
    animation: spin 60s linear infinite;
    will-change: transform;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.avatar__img {
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    background: rgba(20, 22, 26, 0.9);
    box-shadow:
        0 0 0 3px rgba(8, 9, 11, 0.9),
        0 10px 24px rgba(0, 0, 0, 0.55);
}

/* 常驻高光：左上角柔光，让头像始终有「有光」的感觉 */
.avatar__glow {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: 50%;
    pointer-events: none;
    background:
        radial-gradient(circle at 30% 24%,
            rgba(255, 255, 255, 0.34) 0%,
            rgba(255, 255, 255, 0.12) 28%,
            transparent 58%);
    opacity: 0.9;
    mix-blend-mode: screen;
}

/* 动态扫光：更亮、更快（5.5s 一轮循环） */
.avatar__shine {
    position: absolute;
    inset: 0;
    z-index: 3;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
    background: linear-gradient(115deg,
            transparent 34%,
            rgba(255, 255, 255, 0.12) 43%,
            rgba(255, 255, 255, 0.42) 50%,
            rgba(255, 255, 255, 0.12) 57%,
            transparent 66%);
    background-size: 260% 260%;
    background-position: 140% 140%;
    opacity: 0;
    animation: shine-sweep 5.5s ease-in-out 1s infinite;
    mix-blend-mode: screen;
}

@keyframes shine-sweep {
    0% {
        opacity: 0;
        background-position: 140% 140%;
    }

    4% {
        opacity: 0.95;
    }

    16% {
        opacity: 0.95;
        background-position: -40% -40%;
    }

    24% {
        opacity: 0;
        background-position: -40% -40%;
    }

    100% {
        opacity: 0;
        background-position: -40% -40%;
    }
}

.avatar__status {
    position: absolute;
    right: 4px;
    bottom: 6px;
    z-index: 4;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #22c55e;
    border: 3px solid #0b0d10;
    animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
    to {
        box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
    }
}

/* ===== 文字 ===== */
.name {
    margin: 0 0 8px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(92deg, #ffffff 0%, #d6dae2 60%, #9aa4b4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.desc {
    margin: 10px;
    font-size: 14px;
    line-height: 1.85;
    color: #a9b2c1;
}

.br {
    display: none;
}

/* ===== 搜索容器 ===== */
.card__search {
    width: 80%;
    margin: 10px auto 50px;
}

/* ===== 标签 ===== */
.tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin: 10px;
    padding: 0;
    list-style: none;
}

.tag {
    padding: 5px 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;

    &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.35);
    }
}

/* ===== 背面：社交链接 ===== */
.social__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 30px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--c-text-dim);
    text-transform: uppercase;

    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, var(--c-border), transparent);
    }
}

.social__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
}

.social__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    box-sizing: border-box;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    &:hover,
    &:focus-visible {
        outline: none;
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--c-border-strong);

        .social__arrow {
            opacity: 1;
            transform: translate(0, 0);
        }

        .social__icon {
            color: #fff;
            border-color: var(--c-border-strong);
            background: rgba(255, 255, 255, 0.16);
        }
    }
}

.social__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 34px;
    height: 34px;

    i {
        font-size: 18px;

    }

    color: rgba(255, 255, 255, 0.75);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    transition: color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.social__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    text-align: left;
}

.social__name {
    font-size: 13px;
    font-weight: 600;
    color: #eef1f6;
}

.social__sub {
    font-size: 11px;
    color: var(--c-text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.social__arrow {
    margin-left: auto;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    opacity: 0;
    transform: translate(-4px, 4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
    .profile {
        --avatar-size: 84px;
    }

    .card--front {
        padding: calc(var(--avatar-shift) + 14px) 20px 28px;
    }

    .card--back {
        padding: 22px 16px 20px;
    }

    .card {
        border-radius: 16px;
    }

    .name {
        font-size: 22px;
    }

    .br {
        display: block;
    }

    .social__list {
        grid-template-columns: 1fr;
    }

    .corner {
        right: 10px;
        bottom: 10px;
        padding: 6px;
        font-size: 10px;


    }
}

/* 尊重系统「减少动效」偏好 */
@media (prefers-reduced-motion: reduce) {

    .avatar__ring,
    .avatar__status,
    .avatar__shine,
    .stage {
        animation: none;
    }

    .avatar__shine {
        opacity: 0;
        background-position: 30% 30%;
    }

    .avatar__glow {
        opacity: 0.6;
    }

    .flipper {
        transition-duration: 0.01s;
    }

    .social__link:hover,
    .social__link:focus-visible,
    .corner:hover,
    .corner:focus-visible,
    .corner:active {
        transform: none;
    }
}
</style>