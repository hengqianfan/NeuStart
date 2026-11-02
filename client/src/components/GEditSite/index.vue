<!-- src/components/SiteEditor/index.vue -->
<template>
    <Teleport to="body">
        <Transition name="se-fade">
            <div v-if="visible" class="se-mask" @click.self="close">
                <div class="se-panel" role="dialog" aria-modal="true">
                    <header class="se-head">
                        <h2 class="se-title">数据编辑</h2>
                        <span class="se-env" :class="envClass">{{ envLabel }}</span>
                        <button class="se-close" aria-label="关闭" @click="close">
                            <i class="iconfont icon-close" />
                        </button>
                    </header>

                    <!-- 生产环境提示 -->
                    <div v-if="!isDev" class="se-tip">
                        <p class="se-tip__t">当前为生产环境（静态站点），无法写入本地文件。</p>
                        <p class="se-tip__d">
                            请在本地 <code>npm run dev</code> 环境下使用本编辑器，保存后重新构建即可发布。
                        </p>
                        <div class="se-tip__ops">
                            <button class="se-btn se-btn--ghost" @click="exportJson">导出 sites.json</button>
                            <button class="se-btn se-btn--ghost" @click="copyJson">复制 JSON</button>
                        </div>
                    </div>

                    <template v-else>
                        <div class="se-body">
                            <!-- 左：列表 -->
                            <aside class="se-list">
                                <div class="se-list__bar">
                                    <input v-model="q" class="se-input" placeholder="搜索名称 / 链接 / 标签" />
                                    <button class="se-btn se-btn--sm" @click="addSite">新增</button>
                                </div>
                                <ul class="se-list__ul">
                                    <li v-for="(s, i) in filtered" :key="i" class="se-list__li" :class="{
                                        'is-active': i === activeIdx,
                                        'is-draft': isDraft(s),
                                        'is-dimmed': hasDraft && !isDraft(s),
                                    }" @click="activeIdx = i">
                                        <span class="se-list__name">
                                            {{ s.name }}
                                            <em v-if="isDraft(s)" class="se-list__badge">待填写</em>
                                        </span>
                                        <span class="se-list__kind">{{ s.categoryId }} · {{ s.kind }}</span>
                                        <button class="se-del" title="删除" @click.stop="askRemove(i)">×</button>
                                    </li>
                                    <li v-if="!filtered.length" class="se-empty">无匹配项</li>
                                </ul>
                            </aside>

                            <!-- 右：表单 -->
                            <section v-if="current" class="se-form">
                                <label class="se-f"><span>名称 *</span><input v-model="current.name"
                                        class="se-input" /></label>

                                <!-- 一级分类：下拉 -->
                                <label class="se-f">
                                    <span>分类 *</span>
                                    <select v-model="current.categoryId" class="se-input" @change="onCategoryChange">
                                        <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">
                                            {{ c.id }} · {{ c.name }}
                                        </option>
                                    </select>
                                </label>

                                <!-- 二级分类：下拉（联动） -->
                                <label class="se-f">
                                    <span>类型 *</span>
                                    <select v-model="current.kind" class="se-input">
                                        <option value="" disabled>请选择类型</option>
                                        <option v-for="k in kindOptions" :key="k" :value="k">{{ k }}</option>
                                    </select>
                                </label>

                                <label class="se-f"><span>图标</span><input v-model="current.icon" class="se-input"
                                        placeholder="github" /></label>
                                <label class="se-f se-f--full"><span>链接 *</span><input v-model="current.link"
                                        class="se-input" /></label>
                                <label class="se-f se-f--full"><span>描述</span><textarea v-model="current.desc"
                                        class="se-input" rows="2" /></label>

                                <!-- 标签：输入空格 / 中英文逗号 / 顿号 / 分号 自动分隔 -->
                                <label class="se-f se-f--full">
                                    <span>标签（输入空格、逗号或回车自动分隔）</span>
                                    <input ref="tagInput" :value="tagText" class="se-input"
                                        placeholder="例如：React Vue 前端" @input="onTagsInput" @keydown="onTagsKeydown"
                                        @blur="flushTagsText" />
                                </label>

                                <label class="se-f">
                                    <span>置顶权重</span>
                                    <input :value="current.pin ?? ''" type="number" class="se-input"
                                        @input="current.pin = Number(($event.target as HTMLInputElement).value) || undefined" />
                                </label>

                                <!-- 草稿未填写提示 -->
                                <p v-if="isDraft(current)" class="se-draft-tip">
                                    这是未填写的新增条目，填写名称与链接后才会被保存；取消选中将自动丢弃。
                                </p>
                            </section>
                        </div>

                        <footer class="se-foot">
                            <span class="se-count">共 {{ list.length }} 条</span>
                            <div class="se-acts">
                                <button class="se-btn se-btn--ghost" @click="exportJson">导出</button>
                                <button class="se-btn se-btn--primary" :disabled="saving" @click="save">
                                    {{ saving ? '保存中…' : '保存到 sites.json' }}
                                </button>
                            </div>
                        </footer>
                        <p v-if="msg" class="se-msg" :class="msgType">{{ msg }}</p>
                    </template>
                </div>

                <!-- 删除确认（面板保持中性，仅提示文本与确认按钮为红色） -->
                <Transition name="se-fade">
                    <div v-if="pendingRemoveSite" class="se-confirm" @click.self="cancelRemove">
                        <div class="se-confirm__box" role="alertdialog" aria-modal="true">
                            <p class="se-confirm__t">
                                <i class="iconfont icon-warning" /><span>确认删除？</span>
                            </p>
                            <p class="se-confirm__d">
                                「{{ pendingRemoveSite.name || '未命名' }}」将被移除，保存后不可恢复。
                            </p>
                            <div class="se-confirm__ops">
                                <button class="se-btn se-btn--ghost" @click="cancelRemove">取消</button>
                                <button class="se-btn se-btn--danger" @click="confirmRemove">删除</button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import rawSites from '@/config/sites.json'
import { CATEGORIES, KINDS, type CategoryId, type Site } from '@/types/site'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const isDev = import.meta.env.DEV

const list = ref<Site[]>(JSON.parse(JSON.stringify(rawSites)) as Site[])
const q = ref('')
const activeIdx = ref(0)
const saving = ref(false)
const msg = ref('')
const msgType = ref<'ok' | 'err'>('ok')

const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

/* ============ 新增草稿判定 ============ */

const DRAFT_NAME = '新站点'
const DRAFT_LINK = 'https://'

/** 名称与链接都还是默认值 → 视为草稿，不计入保存 / 导出 / 校验 */
function isDraft(s?: Site): boolean {
    if (!s) return false
    return s.name.trim() === DRAFT_NAME && (s.link || '').trim() === DRAFT_LINK
}

const hasDraft = computed(() => filtered.value.some((s) => isDraft(s)))

const kindOptions = computed<readonly string[]>(() => {
    const cid = current.value?.categoryId
    return cid ? KINDS[cid] : []
})

const filtered = computed(() => {
    const k = q.value.trim().toLowerCase()
    if (!k) return list.value
    return list.value.filter((s) =>
        [s.name, s.link, s.kind, ...(s.tags || [])].join(' ').toLowerCase().includes(k),
    )
})

const current = computed<Site | undefined>(() => filtered.value[activeIdx.value])

const envLabel = isDev ? 'DEV · 可写入' : 'PROD · 只读'
const envClass = isDev ? 'is-dev' : 'is-prod'

/* ============ 选中下标收敛 ============ */

/** 列表长度变化后，保证 activeIdx 合法 */
function clampActive() {
    const max = filtered.value.length - 1
    if (max < 0) {
        activeIdx.value = 0
    } else if (activeIdx.value > max) {
        activeIdx.value = max
    } else if (activeIdx.value < 0) {
        activeIdx.value = 0
    }
}

/* ============ 标签输入处理 ============ */

const tagText = ref('')
const tagInput = ref<HTMLInputElement | null>(null)

const TAG_SEP = /[,，、;；\s]+/

function splitTags(val: string): string[] {
    const seen = new Set<string>()
    const out: string[] = []
    for (const raw of val.split(TAG_SEP)) {
        const t = raw.trim()
        if (!t || seen.has(t)) continue
        seen.add(t)
        out.push(t)
    }
    return out
}

function joinTags(tags?: string[]): string {
    return (tags ?? []).join(', ')
}

watch(
    current,
    (s) => {
        tagText.value = joinTags(s?.tags)
    },
    { immediate: true },
)

function normalizeTagText(val: string): string {
    const endedWithSep = /[,，、;；\s]$/.test(val)
    const tags = splitTags(val)
    const base = tags.join(', ')
    if (!base) return ''
    return endedWithSep ? `${base}, ` : base
}

function onTagsInput(e: Event) {
    const el = e.target as HTMLInputElement
    const s = current.value
    if (!s) return

    const normalized = normalizeTagText(el.value)
    tagText.value = normalized
    if (el.value !== normalized) {
        el.value = normalized
        const pos = normalized.length
        requestAnimationFrame(() => el.setSelectionRange(pos, pos))
    }
    s.tags = splitTags(normalized)
}

function onTagsKeydown(e: KeyboardEvent) {
    const el = e.target as HTMLInputElement
    const s = current.value
    if (!s) return

    if (e.key === 'Enter') {
        e.preventDefault()
        flushTagsText()
        return
    }

    if (e.key === ' ') {
        const caret = el.selectionStart ?? el.value.length
        const before = el.value.slice(0, caret)
        if (!before.trim()) {
            e.preventDefault()
            return
        }
        if (/[,\uFF0C、;；\s]$/.test(before)) {
            e.preventDefault()
            return
        }
        e.preventDefault()
        const next = `${el.value.slice(0, caret).replace(/[,\uFF0C、;；\s]+$/, '')}, ${el.value.slice(caret).replace(/^[,\uFF0C、;；\s]+/, '')}`
        const normalized = normalizeTagText(next)
        tagText.value = normalized
        el.value = normalized
        const pos = normalized.length
        requestAnimationFrame(() => el.setSelectionRange(pos, pos))
        s.tags = splitTags(normalized)
    }
}

function flushTagsText() {
    const s = current.value
    if (!s) return
    const normalized = splitTags(tagText.value).join(', ')
    tagText.value = normalized
    if (tagInput.value) tagInput.value.value = normalized
    s.tags = splitTags(normalized)
}

/* ============ 其他操作 ============ */

function close() {
    discardDrafts()
    visible.value = false
}

function addSite() {
    discardDrafts()
    list.value.unshift({
        name: DRAFT_NAME,
        categoryId: '001' as CategoryId,
        kind: KINDS['001'][0],
        desc: '',
        tags: [],
        link: DRAFT_LINK,
    })
    q.value = ''
    activeIdx.value = 0
    tagText.value = ''
    msg.value = ''
}

function discardDrafts() {
    for (let i = list.value.length - 1; i >= 0; i--) {
        const s = list.value[i]
        if (s && isDraft(s)) list.value.splice(i, 1)
    }
    clampActive()
}

/* ---------- 删除确认 ---------- */

const pendingRemoveSite = ref<Site | null>(null)

function askRemove(i: number) {
    const target = filtered.value[i]
    if (!target) return
    if (isDraft(target)) {
        // 空草稿无需确认，直接丢弃
        doRemove(target)
        return
    }
    pendingRemoveSite.value = target
}

function cancelRemove() {
    pendingRemoveSite.value = null
}

function confirmRemove() {
    const target = pendingRemoveSite.value
    pendingRemoveSite.value = null
    if (target) doRemove(target)
}

/**
 * 删除指定条目：
 * 1. 先记录它在列表(filtered)中的位置；
 * 2. 从源数组中移除；
 * 3. 若删除的是当前选中项，把选中项落到「原位置」或前一条，避免列表第一条删不掉 / 选中错位。
 */
function doRemove(target: Site) {
    const posInFiltered = filtered.value.indexOf(target)
    const realIdx = list.value.indexOf(target)
    if (realIdx > -1) list.value.splice(realIdx, 1)

    if (posInFiltered > -1 && posInFiltered === activeIdx.value) {
        // 选中项被删：优先选中同一位置（原下一条），否则退回前一条
        activeIdx.value = Math.max(0, Math.min(posInFiltered, filtered.value.length - 1))
    }
    // 非选中项被删，但删除位置在选中项之前时，选中项自动上移一位
    else if (posInFiltered > -1 && posInFiltered < activeIdx.value) {
        activeIdx.value -= 1
    }
    clampActive()
    // 同步标签文本
    tagText.value = joinTags(current.value?.tags)
}

function onCategoryChange() {
    const s = current.value
    if (!s) return
    const opts = KINDS[s.categoryId]
    if (!opts.includes(s.kind as never)) {
        s.kind = opts[0]
    }
}

function validate(): string | null {
    for (let i = 0; i < list.value.length; i++) {
        const s = list.value[i]
        if (!s) continue
        if (isDraft(s)) continue
        const at = `第 ${i + 1} 条（${s.name || '未命名'}）`
        if (!s.name.trim()) return `${at}：名称不能为空`
        if (!s.categoryId) return `${at}：请选择分类`
        if (!s.kind) return `${at}：请选择类型`
        if (!s.link) return `${at}：链接不能为空`
        if (!/^https?:\/\//i.test(s.link)) return `${at}：链接需以 http(s):// 开头`
        if (!KINDS[s.categoryId]?.includes(s.kind as never)) {
            return `${at}：类型与分类不匹配`
        }
    }
    return null
}

function snapshot() {
    flushTagsText()
    const data = list.value.filter((s) => !isDraft(s))
    return JSON.stringify(data, null, 2)
}

function exportJson() {
    const blob = new Blob([snapshot()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sites.json'
    a.click()
    URL.revokeObjectURL(a.href)
}

async function copyJson() {
    await navigator.clipboard.writeText(snapshot())
    msg.value = '已复制到剪贴板'
    msgType.value = 'ok'
}

async function save() {
    if (!isDev) {
        msg.value = '生产环境不可写入，请导出后重新构建'
        msgType.value = 'err'
        return
    }
    flushTagsText()
    const err = validate()
    if (err) {
        msg.value = err
        msgType.value = 'err'
        return
    }
    saving.value = true
    msg.value = ''
    try {
        const res = await fetch('/__sites/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: snapshot(),
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.message || '保存失败')
        msg.value = `已写入 src/config/sites.json，共 ${data.count} 条`
        msgType.value = 'ok'
    } catch (e: any) {
        msg.value = e.message
        msgType.value = 'err'
    } finally {
        saving.value = false
    }
}

watch(visible, (v) => {
    if (v) {
        msg.value = ''
    } else {
        pendingRemoveSite.value = null
    }
})

// 搜索词变化后，选中下标可能越界
watch(filtered, () => clampActive())
</script>

<style lang="scss" scoped>
/* ================= 遮罩 ================= */
.se-mask {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .66);
    backdrop-filter: blur(8px) saturate(120%);
}

/* ================= 面板 ================= */
.se-panel {
    position: relative;
    width: min(1180px, 94vw);
    height: min(760px, 88vh);
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, rgba(24, 24, 27, .98), rgba(14, 14, 16, .99));
    border: 1px solid rgba(255, 255, 255, .14);
    border-radius: 18px;
    box-shadow:
        0 32px 80px -20px rgba(0, 0, 0, .85),
        0 0 0 1px rgba(255, 255, 255, .04) inset,
        0 1px 0 rgba(255, 255, 255, .08) inset;
    color: rgba(255, 255, 255, .9);
    overflow: hidden;
    font-size: 13px;
}

/* ================= 头部 ================= */
.se-head {
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, .08);
    background: rgba(255, 255, 255, .02);
}

.se-title {
    margin: 0;
    font-size: 15px;
    font-weight: 650;
    letter-spacing: .3px;
}

.se-env {
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .4px;
    border-radius: 999px;
    white-space: nowrap;

    &.is-dev {
        color: #7ee787;
        background: rgba(126, 231, 135, .12);
        border: 1px solid rgba(126, 231, 135, .35);
    }

    &.is-prod {
        color: #ffa657;
        background: rgba(255, 166, 87, .12);
        border: 1px solid rgba(255, 166, 87, .35);
    }
}

.se-close {
    margin-left: auto;
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 9px;
    background: rgba(255, 255, 255, .06);
    color: rgba(255, 255, 255, .6);
    cursor: pointer;
    transition: background .18s ease, color .18s ease, transform .18s ease;

    &:hover {
        background: rgba(255, 255, 255, .14);
        color: #fff;
    }

    &:active {
        transform: scale(.94);
    }
}

/* ================= 生产环境提示 ================= */
.se-tip {
    padding: 24px 22px;
    line-height: 1.75;

    &__t {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
        color: #ffa657;
    }

    &__d {
        margin: 0 0 16px;
        font-size: 13px;
        color: rgba(255, 255, 255, .6);
    }

    &__ops {
        display: flex;
        gap: 10px;
    }

    code {
        padding: 2px 6px;
        border-radius: 5px;
        font-size: 12px;
        background: rgba(255, 255, 255, .1);
    }
}

/* ================= 主体 ================= */
.se-body {
    display: flex;
    flex: 1;
    min-height: 0;
}

/* ---------- 左侧列表 ---------- */
.se-list {
    flex: 0 0 340px;
    width: 340px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid rgba(255, 255, 255, .08);
    background: rgba(255, 255, 255, .015);

    &__bar {
        flex: none;
        display: flex;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, .06);

        .se-input {
            flex: 1;
            min-width: 0;
        }
    }

    &__ul {
        flex: 1;
        margin: 0;
        padding: 8px;
        list-style: none;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, .18) transparent;

        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, .16);
            border-radius: 999px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, .3);
        }
    }

    &__li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows: auto auto;
        align-items: center;
        gap: 3px 10px;
        padding: 9px 10px 9px 12px;
        margin-bottom: 2px;
        border-radius: 10px;
        border: 1px solid transparent;
        cursor: pointer;
        position: relative;
        transition: background .16s ease, border-color .16s ease,
            opacity .2s ease, filter .2s ease;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 3px;
            height: 0;
            background: #8b8bff;
            border-radius: 0 2px 2px 0;
            transform: translateY(-50%);
            transition: height .18s ease;
        }

        &:hover {
            background: rgba(255, 255, 255, .06);
        }

        &.is-active {
            background: rgba(139, 139, 255, .14);
            border-color: rgba(139, 139, 255, .32);

            &::before {
                height: 60%;
            }

            .se-list__name {
                color: #fff;
            }
        }

        /* 新增草稿：虚线高亮 */
        &.is-draft {
            border-style: dashed;
            border-color: rgba(126, 231, 135, .45);
            background: rgba(126, 231, 135, .07);

            &.is-active {
                background: rgba(126, 231, 135, .13);
                border-color: rgba(126, 231, 135, .7);

                &::before {
                    background: #7ee787;
                }
            }
        }

        /* 存在草稿时，其它条目减弱 */
        &.is-dimmed {
            opacity: .45;
            filter: saturate(.6);

            &:hover {
                opacity: .85;
                filter: none;
            }
        }
    }

    &__name {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        font-weight: 500;
        color: rgba(255, 255, 255, .92);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__badge {
        flex: none;
        padding: 1px 6px;
        font-size: 10px;
        font-style: normal;
        font-weight: 600;
        color: #7ee787;
        background: rgba(126, 231, 135, .14);
        border: 1px solid rgba(126, 231, 135, .35);
        border-radius: 999px;
    }

    &__kind {
        grid-column: 1;
        min-width: 0;
        font-size: 11.5px;
        color: rgba(255, 255, 255, .45);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.se-del {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: rgba(255, 255, 255, .38);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity .16s ease, color .16s ease, background .16s ease;

    &:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, .16);
    }
}

.se-list__li:hover .se-del,
.se-list__li.is-active .se-del {
    opacity: 1;
}

.se-empty {
    padding: 28px 20px;
    text-align: center;
    color: rgba(255, 255, 255, .35);
    font-size: 12.5px;
}

/* ---------- 右侧表单 ---------- */
.se-form {
    flex: 1;
    min-width: 0;
    padding: 18px 20px 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 16px;
    align-content: start;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, .18) transparent;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, .16);
        border-radius: 999px;

        &:hover {
            background: rgba(255, 255, 255, .3);
        }
    }
}

.se-f {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, .55);

    >span {
        padding-left: 2px;
        font-weight: 500;
        letter-spacing: .2px;
    }

    &--full {
        grid-column: 1 / -1;
    }
}

.se-draft-tip {
    grid-column: 1 / -1;
    margin: 0;
    padding: 9px 12px;
    font-size: 12px;
    line-height: 1.6;
    color: #7ee787;
    background: rgba(126, 231, 135, .08);
    border: 1px dashed rgba(126, 231, 135, .4);
    border-radius: 9px;
}

.se-input,
select.se-input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 11px;
    font-size: 13px;
    font-family: inherit;
    color: rgba(255, 255, 255, .92);
    background: rgba(255, 255, 255, .045);
    border: 1px solid rgba(255, 255, 255, .12);
    border-radius: 9px;
    outline: none;
    resize: vertical;
    transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;

    &::placeholder {
        color: rgba(255, 255, 255, .3);
    }

    &:hover {
        border-color: rgba(255, 255, 255, .2);
    }

    &:focus {
        border-color: rgba(139, 139, 255, .55);
        background: rgba(255, 255, 255, .08);
        box-shadow: 0 0 0 3px rgba(139, 139, 255, .14);
    }

    option {
        color: #111;
        background: #fff;
    }
}

/* ================= 底部 ================= */
.se-foot {
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 20px;
    border-top: 1px solid rgba(255, 255, 255, .08);
    background: rgba(255, 255, 255, .02);
}

.se-count {
    font-size: 12px;
    color: rgba(255, 255, 255, .45);
    font-variant-numeric: tabular-nums;
}

.se-acts {
    margin-left: auto;
    display: flex;
    gap: 8px;
}

.se-btn {
    padding: 8px 16px;
    font-size: 13px;
    font-family: inherit;
    line-height: 1;
    cursor: pointer;
    border-radius: 9px;
    border: 1px solid transparent;
    transition: background .18s ease, border-color .18s ease,
        color .18s ease, transform .12s ease;

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &--sm {
        padding: 7px 12px;
        font-size: 12.5px;
        flex: none;
        /* 新增按钮：深蓝实底，贴合面板暗色风格 */
        color: rgba(255, 255, 255, .92);
        background: rgba(58, 92, 168, .55);
        border-color: rgba(110, 150, 235, .42);

        &:hover {
            background: rgba(72, 112, 198, .72);
            border-color: rgba(130, 170, 245, .6);
            color: #fff;
        }
    }

    &--ghost {
        color: rgba(255, 255, 255, .85);
        background: rgba(255, 255, 255, .06);
        border-color: rgba(255, 255, 255, .14);

        &:hover {
            background: rgba(255, 255, 255, .12);
            border-color: rgba(255, 255, 255, .24);
        }
    }

    &--primary {
        color: #0a0a0c;
        background: rgba(255, 255, 255, .94);
        font-weight: 600;
        box-shadow: 0 4px 14px -6px rgba(255, 255, 255, .5);

        &:hover:not(:disabled) {
            background: #fff;
        }

        &:disabled {
            opacity: .4;
            cursor: not-allowed;
            box-shadow: none;
        }
    }

    /* 危险操作：红色实底（仅确认按钮使用） */
    &--danger {
        color: #fff;
        font-weight: 600;
        background: linear-gradient(180deg, #f0575c, #d93a41);
        border-color: rgba(255, 120, 125, .55);
        box-shadow: 0 6px 18px -8px rgba(224, 60, 68, .9);

        &:hover {
            background: linear-gradient(180deg, #ff6b70, #e2454c);
            border-color: rgba(255, 150, 155, .75);
        }

        &:focus-visible {
            outline: none;
            box-shadow:
                0 0 0 3px rgba(255, 90, 96, .28),
                0 6px 18px -8px rgba(224, 60, 68, .9);
        }
    }
}

.se-msg {
    flex: none;
    margin: 0;
    padding: 0 20px 14px;
    font-size: 12.5px;

    &.ok {
        color: #7ee787;
    }

    &.err {
        color: #ff6b6b;
    }
}

/* ================= 删除确认框（中性面板 + 红色提示） ================= */
.se-confirm {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, .55);
    backdrop-filter: blur(2px);

    &__box {
        width: min(360px, 100%);
        padding: 20px 20px 16px;
        border-radius: 14px;
        /* 面板保持中性暗色，与整体风格一致 */
        background: rgba(30, 30, 34, .99);
        border: 1px solid rgba(255, 255, 255, .16);
        box-shadow: 0 24px 60px -16px rgba(0, 0, 0, .8);
        animation: se-pop .16s ease;
    }

    /* 标题：红色 */
    &__t {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 650;
        color: #ff6b70;

        .iconfont {
            font-size: 15px;
            color: #ff5a60;
        }
    }

    /* 说明文本：淡红 */
    &__d {
        margin: 0 0 18px;
        font-size: 12.5px;
        line-height: 1.65;
        color: rgb(238, 226, 226);
        word-break: break-all;
    }

    &__ops {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
}

@keyframes se-pop {
    from {
        transform: translateY(6px) scale(.98);
        opacity: 0;
    }

    to {
        transform: none;
        opacity: 1;
    }
}

/* ================= 动效 ================= */
.se-fade-enter-active,
.se-fade-leave-active {
    transition: opacity .2s ease;

    .se-panel {
        transition: transform .2s ease, opacity .2s ease;
    }
}

.se-fade-enter-from,
.se-fade-leave-to {
    opacity: 0;

    .se-panel {
        transform: translateY(8px) scale(.985);
        opacity: 0;
    }
}

/* ================= 响应式 ================= */
@media (max-width: 1024px) {
    .se-panel {
        width: 96vw;
        height: 92vh;
    }

    .se-list {
        flex: 0 0 290px;
        width: 290px;
    }
}

@media (max-width: 768px) {
    .se-mask {
        padding: 0;
    }

    .se-panel {
        width: 100vw;
        height: 100dvh;
        max-height: none;
        border-radius: 0;
        border: none;
    }

    .se-body {
        flex-direction: column;
    }

    .se-list {
        flex: 0 0 auto;
        width: 100%;
        max-height: 42%;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, .08);
    }

    .se-form {
        grid-template-columns: minmax(0, 1fr);
        padding: 16px;
    }

    .se-f--full {
        grid-column: auto;
    }
}

@media (prefers-reduced-motion: reduce) {

    .se-fade-enter-active,
    .se-fade-leave-active,
    .se-fade-enter-from .se-panel,
    .se-fade-leave-to .se-panel,
    .se-confirm__box {
        transition-duration: .01ms !important;
        animation: none !important;
    }
}
</style>