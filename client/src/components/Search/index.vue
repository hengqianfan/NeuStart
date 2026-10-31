<template>
    <form class="search" role="search" @submit.prevent="submit" @click.stop>
        <!-- 输入框：引擎选择器内嵌在左侧 -->
        <div class="search__field">
            <!-- 引擎切换：点击 / 悬浮展开 -->
            <div class="engine" :class="{ 'is-open': open }" @mouseenter="open = true" @mouseleave="open = false">
                <button ref="triggerRef" type="button" class="engine__trigger" :aria-expanded="open"
                    aria-haspopup="listbox" :aria-label="`搜索引擎：${activeEngine.label}，点击切换`" @click="open = !open"
                    @keydown.down.prevent="open = true">
                    <i :class="`iconfont icon-${activeEngine.icon}`" aria-hidden="true" />
                    <i class="iconfont icon-down engine__caret" aria-hidden="true" />
                </button>

                <!-- 下拉列表 -->
                <transition name="engine-pop">
                    <ul v-show="open" class="engine__menu" role="listbox" :aria-label="'选择搜索引擎'">
                        <li v-for="engine in engines" :key="engine.key" role="none">
                            <button type="button" class="engine__item" role="option"
                                :aria-selected="engine.key === activeKey"
                                :class="{ 'is-active': engine.key === activeKey }" :title="engine.label"
                                @click="selectEngine(engine.key)">
                                <span class="engine__item-icon">
                                    <i :class="`iconfont icon-${engine.icon}`" aria-hidden="true" />
                                </span>
                                <span class="engine__item-label">{{ engine.label }}</span>
                                <i v-if="engine.key === activeKey" class="iconfont icon-check engine__check"
                                    aria-hidden="true" />
                            </button>
                        </li>
                    </ul>
                </transition>
            </div>

            <span class="search__divider" aria-hidden="true" />

            <input ref="inputRef" v-model="keyword" type="search" class="search__input"
                :placeholder="`在 ${activeEngine.label} 中搜索…`" :aria-label="`在 ${activeEngine.label} 中搜索`"
                autocomplete="off" enterkeyhint="search" />

            <button v-if="keyword" type="button" class="search__clear" aria-label="清空" @click="clear">
                <i class="iconfont icon-close" aria-hidden="true" />
            </button>

            <button type="submit" class="search__submit" :disabled="!keyword.trim()" aria-label="搜索">
                <i class="iconfont icon-search" aria-hidden="true" />
            </button>
        </div>

        <!-- 快捷键提示 -->
        <p class="search__hint">
            按 <kbd>Enter</kbd> 搜索 · <kbd>Ctrl</kbd> + <kbd>K</kbd> 聚焦
        </p>
    </form>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface SearchEngine {
    key: string
    label: string
    icon: string
    /** 关键词占位符 */
    url: string
    /** 是否新标签打开 */
    blank?: boolean
}

const engines: SearchEngine[] = [
    { key: 'bing', label: '必应', icon: 'bing', url: 'https://www.bing.com/search?q=%s', blank: true },
    { key: 'google', label: 'Google', icon: 'google', url: 'https://www.google.com/search?q=%s', blank: true },
    { key: 'bilibili', label: '哔哩哔哩', icon: 'bilibili', url: 'https://search.bilibili.com/all?keyword=%s', blank: true },
    { key: 'baidu', label: '百度', icon: 'baidu', url: 'https://www.baidu.com/s?wd=%s', blank: true },
    { key: 'github', label: 'GitHub', icon: 'github', url: 'https://github.com/search?q=%s', blank: true },
    { key: 'zhihu', label: '知乎', icon: 'zhihu', url: 'https://www.zhihu.com/search?type=content&q=%s', blank: true },
]

const STORAGE_KEY = 'profile.search.engine'

const activeKey = ref<string>(engines[0].key)
const keyword = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const open = ref(false)

const activeEngine = computed(
    () => engines.find((e) => e.key === activeKey.value) ?? engines[0],
)

function buildUrl(engine: SearchEngine, kw: string) {
    return engine.url.replace('%s', encodeURIComponent(kw))
}

function submit() {
    const kw = keyword.value.trim()
    if (!kw) return

    const url = buildUrl(activeEngine.value, kw)
    if (activeEngine.value.blank === false) {
        window.location.href = url
    } else {
        window.open(url, '_blank', 'noopener,noreferrer')
    }
}

function clear() {
    keyword.value = ''
    inputRef.value?.focus()
}

function selectEngine(key: string) {
    activeKey.value = key
    open.value = false
    // 选完把焦点还给输入框，方便直接打字
    inputRef.value?.focus()
}

/* 记住上次使用的搜索引擎 */
function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, activeKey.value)
    } catch {
        /* 隐私模式下忽略 */
    }
}

function restore() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && engines.some((e) => e.key === saved)) activeKey.value = saved
    } catch {
        /* ignore */
    }
}

/* Ctrl/⌘ + K 聚焦 */
function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.value?.focus()
        inputRef.value?.select()
    }
    /* Esc 关闭下拉 */
    if (e.key === 'Escape' && open.value) {
        open.value = false
        triggerRef.value?.focus()
    }
}

/* 点击外部关闭下拉（移动端 hover 不生效时需要） */
function onDocClick(e: MouseEvent) {
    if (!open.value) return
    const target = e.target as Node | null
    if (triggerRef.value && !triggerRef.value.parentElement?.contains(target)) {
        open.value = false
    }
}

onMounted(() => {
    restore()
    window.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onDocClick)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onDocClick)
})

watch(activeKey, persist)
</script>

<style lang="scss" scoped>
/* ===== 黑透主题变量（不依赖父级，可独立使用） ===== */
.search {
    --s-primary: rgba(255, 255, 255, 0.92);
    --s-primary-dark: rgba(255, 255, 255, 0.72);
    --s-bg: rgba(255, 255, 255, 0.05);
    --s-bg-hover: rgba(255, 255, 255, 0.09);
    --s-bg-active: rgba(255, 255, 255, 0.13);
    --s-border: rgba(255, 255, 255, 0.14);
    --s-border-strong: rgba(255, 255, 255, 0.3);
    --s-text: rgba(255, 255, 255, 0.92);
    --s-text-dim: rgba(255, 255, 255, 0.55);
    --s-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);

    width: 100%;
    box-sizing: border-box;
}

/* ===== 输入区 ===== */
.search__field {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 6px;
    background: var(--s-bg);
    border: 1px solid var(--s-border);
    border-radius: 12px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

    &:focus-within {
        background: var(--s-bg-hover);
        border-color: var(--s-border-strong);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
    }
}

/* ===== 引擎选择器（内嵌在输入框内） ===== */
.engine {
    position: relative;
    flex: 0 0 auto;
}

.engine__trigger {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    font-size: 15px;
    line-height: 1;
    color: var(--s-text-dim);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 8px;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover,
    &:focus-visible,
    .engine.is-open & {
        outline: none;
        color: var(--s-text);
        background: var(--s-bg-active);
    }
}

.engine__caret {
    font-size: 9px;
    opacity: 0.7;
    transition: transform 0.2s ease;

    .engine.is-open & {
        transform: rotate(180deg);
    }
}

/* 分隔线 */
.search__divider {
    flex: 0 0 auto;
    width: 1px;
    height: 18px;
    background: linear-gradient(180deg,
            transparent,
            rgba(255, 255, 255, 0.22),
            transparent);
}

/* 下拉面板 */
.engine__menu {
    position: absolute;
    top: calc(100% + 10px);
    left: -6px;
    z-index: 20;
    min-width: 168px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: rgba(14, 14, 16, 0.94);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    backdrop-filter: blur(18px) saturate(140%);
    border: 1px solid var(--s-border-strong);
    border-radius: 12px;
    box-shadow:
        0 20px 44px rgba(0, 0, 0, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* 小尖角 */
.engine__menu::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 18px;
    width: 8px;
    height: 8px;
    background: rgba(14, 14, 16, 0.94);
    border-left: 1px solid var(--s-border-strong);
    border-top: 1px solid var(--s-border-strong);
    transform: rotate(45deg);
}

.engine__item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    color: var(--s-text-dim);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 8px;
    transition: color 0.18s ease, background-color 0.18s ease;

    &:hover,
    &:focus-visible {
        outline: none;
        color: var(--s-text);
        background: var(--s-bg-active);
    }

    &.is-active {
        color: var(--s-text);
        background: var(--s-bg-hover);
    }
}

.engine__item-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    font-size: 14px;
    color: var(--s-text-dim);
    border-radius: 6px;
    background: var(--s-bg);
}

.engine__item-label {
    flex: 1 1 auto;
    white-space: nowrap;
}

.engine__check {
    flex: 0 0 auto;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
}

/* 下拉出现动画 */
.engine-pop-enter-active,
.engine-pop-leave-active {
    transition: opacity 0.16s ease, transform 0.16s ease;
    transform-origin: top left;
}

.engine-pop-enter-from,
.engine-pop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.96);
}

/* ===== 输入框 ===== */
.search__input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 10px 0;
    font-size: 14px;
    font-family: inherit;
    color: var(--s-text);
    background: transparent;
    border: 0;
    outline: none;

    &::placeholder {
        color: var(--s-text-dim);
        opacity: 0.8;
    }

    &::-webkit-search-cancel-button {
        -webkit-appearance: none;
        appearance: none;
    }
}

.search__clear {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    font-size: 12px;
    color: var(--s-text-dim);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 50%;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover,
    &:focus-visible {
        outline: none;
        color: var(--s-text);
        background: var(--s-bg-active);
    }
}

/* 提交按钮：黑透高亮，替代原蓝渐变 */
.search__submit {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    font-size: 15px;
    color: rgba(10, 10, 12, 0.9);
    cursor: pointer;
    background: var(--s-primary);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
    transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease,
        background-color 0.2s ease;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
        outline: none;
        transform: translateY(-1px);
        background: #fff;
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.6);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.32;
        box-shadow: none;
    }
}

/* ===== 提示 ===== */
.search__hint {
    margin: 10px 0 0;
    font-size: 11px;
    line-height: 1.6;
    color: var(--s-text-dim);
    text-align: center;

    kbd {
        padding: 1px 5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 4px;
    }
}

/* ===== 移动端 ===== */
@media (max-width: 480px) {
    .search__field {
        padding-left: 4px;
    }

    .engine__trigger {
        padding: 6px 6px;
    }

    .engine__menu {
        min-width: 150px;
    }
}

/* 尊重「减少动效」偏好 */
@media (prefers-reduced-motion: reduce) {

    .engine__trigger,
    .engine__caret,
    .engine__item,
    .search__field,
    .search__clear,
    .search__submit,
    .engine-pop-enter-active,
    .engine-pop-leave-active {
        transition: none;
    }

    .search__submit:hover:not(:disabled),
    .search__submit:focus-visible:not(:disabled) {
        transform: none;
    }
}
</style>