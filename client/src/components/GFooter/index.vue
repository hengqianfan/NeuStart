<template>
    <footer class="footer" role="contentinfo">
        <div class="footer__inner">
            <p class="footer__copy">
                <span class="footer__mark" aria-hidden="true" />
                © {{ year }}
                <a class="footer__name" :href="homeUrl" target="_blank" rel="noopener noreferrer">
                    {{ myConfig.siteName }}
                </a>
                <template v-if="icp">
                    <span class="footer__sep" aria-hidden="true">·</span>
                    <span class="footer__icp">{{ icp }}</span>
                </template>
            </p>

            <nav class="footer__nav" aria-label="页脚导航">
                <a v-for="item in navs" :key="item.href" class="footer__link" :href="item.href" target="_blank"
                    rel="noopener noreferrer">{{ item.label }}</a>
            </nav>
        </div>
    </footer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { myConfig } from '@/config'

interface FooterNav {
    label: string
    href: string
}

interface Props {
    author?: string
    homeUrl?: string
    icp?: string
    version?: string
    navs?: FooterNav[]
}

const props = withDefaults(defineProps<Props>(), {
    author: 'My Profile',
    homeUrl: '/',
    icp: '111',
    version: 'v1.0.0',
    navs: () => [
        { label: 'GitHub', href: 'https://github.com/' },
        { label: '博客', href: 'https://example.com/' },
        { label: '友链', href: '/links' },
        { label: 'RSS', href: '/feed.xml' },
    ],
})

const year = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
    /* ===== 黑透玻璃变量 ===== */
    --f-text: rgba(255, 255, 255, 0.92);
    --f-dim: rgba(255, 255, 255, 0.6);
    --f-line: rgba(255, 255, 255, 0.1);
    --f-border: rgba(255, 255, 255, 0.12);
    --f-border-strong: rgba(255, 255, 255, 0.3);

    position: fixed;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    width: auto;
    max-width: calc(100vw - 32px);

    z-index: 20;
    box-sizing: border-box;

    color: var(--f-dim);
    font-size: 12px;
    line-height: 1.6;

    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid var(--f-border);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
    backdrop-filter: blur(16px) saturate(130%);
    box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.footer__inner {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 10px 18px;
    padding: 8px 18px;
    box-sizing: border-box;
}

/* ===== 版权 ===== */
.footer__copy {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    white-space: nowrap;
}

.footer__mark {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.45);
}

.footer__name {
    color: var(--f-text);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover,
    &:focus-visible {
        outline: none;
        color: #fff;
        text-decoration: underline;
        text-underline-offset: 3px;
    }
}

.footer__sep {
    opacity: 0.45;
}

.footer__icp {
    color: var(--f-dim);
}

/* ===== 导航 ===== */
.footer__nav {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    white-space: nowrap;
}

.footer__link {
    position: relative;
    color: var(--f-dim);
    text-decoration: none;
    transition: color 0.2s ease;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -3px;
        width: 100%;
        height: 1px;
        background: rgba(255, 255, 255, 0.7);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.25s ease;
    }

    &:hover,
    &:focus-visible {
        outline: none;
        color: var(--f-text);

        &::after {
            transform: scaleX(1);
        }
    }
}

/* ===== 窄屏：允许换行，落下成圆角矩形 ===== */
@media (max-width: 720px) {
    .footer {
        left: 12px;
        right: 12px;
        bottom: 12px;
        width: auto;
        max-width: none;
        transform: none;
        border-radius: 18px;
    }

    .footer__inner {
        flex-wrap: wrap;
        gap: 8px 12px;
        padding: 10px 14px;
        /* 给右上角横向导航留出空间 */
        padding-right: 14px;
    }

    .footer__nav {
        order: 3;
        width: 100%;
        justify-content: center;
    }
}

@media (prefers-reduced-motion: reduce) {

    .footer__link,
    .footer__link::after {
        transition: none;
    }
}
</style>