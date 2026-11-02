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
                                    <li v-for="(s, i) in filtered" :key="s.link + '#' + i" class="se-list__li"
                                        :class="{ 'is-active': i === activeIdx }" @click="activeIdx = i">
                                        <span class="se-list__name">{{ s.name }}</span>
                                        <span class="se-list__kind">{{ s.categoryId }} · {{ s.kind }}</span>
                                        <button class="se-del" title="删除" @click.stop="remove(i)">×</button>
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
                                <label class="se-f se-f--full">
                                    <span>标签（逗号分隔）</span>
                                    <input :value="(current.tags || []).join(',')" class="se-input"
                                        @input="onTagsInput" />
                                </label>
                                <label class="se-f">
                                    <span>置顶权重</span>
                                    <input :value="current.pin ?? ''" type="number" class="se-input"
                                        @input="current.pin = Number(($event.target as HTMLInputElement).value) || undefined" />
                                </label>
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

/** 当前分类下可选的二级分类 */
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

function close() {
    visible.value = false
}

function addSite() {
    list.value.unshift({
        name: '新站点',
        categoryId: '001' as CategoryId,
        kind: KINDS['001'][0],
        desc: '',
        tags: [],
        link: 'https://',
    })
    activeIdx.value = 0
}

function remove(i: number) {
    const target = filtered.value[i]
    if (!target) return
    const real = list.value.indexOf(target)
    if (real > -1) list.value.splice(real, 1)
    if (activeIdx.value >= filtered.value.length) {
        activeIdx.value = Math.max(0, filtered.value.length - 1)
    }
}

/** 切换一级分类时，若原 kind 不属于新分类，自动落到第一个合法值 */
function onCategoryChange() {
    const s = current.value
    if (!s) return
    const opts = KINDS[s.categoryId]
    if (!opts.includes(s.kind as never)) {
        s.kind = opts[0]
    }
}

function onTagsInput(e: Event) {
    const s = current.value
    if (!s) return
    const val = (e.target as HTMLInputElement).value
    s.tags = val.split(',').map((t) => t.trim()).filter(Boolean)
}

/** 表单校验，返回错误信息或 null */
function validate(): string | null {
    for (let i = 0; i < list.value.length; i++) {
        const s = list.value[i]
        if (!s) continue                       // ★ 修复 TS 可能未定义
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
    return JSON.stringify(list.value, null, 2)
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
    if (v) msg.value = ''
})
</script>

<style lang="scss" scoped>
.se-mask {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, .62);
    backdrop-filter: blur(6px);
}

.se-panel {
    width: min(860px, 92vw);
    max-height: 84vh;
    display: flex;
    flex-direction: column;
    background: rgba(16, 16, 18, .97);
    border: 1px solid rgba(255, 255, 255, .16);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, .7);
    color: rgba(255, 255, 255, .9);
    overflow: hidden;
}

.se-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
}

.se-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
}

.se-env {
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 999px;

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
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, .6);
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, .12);
        color: #fff;
    }
}

.se-tip {
    padding: 20px 18px;
    line-height: 1.7;

    &__t {
        margin: 0 0 8px;
        font-size: 14px;
        color: #ffa657;
    }

    &__d {
        margin: 0 0 14px;
        font-size: 13px;
        color: rgba(255, 255, 255, .6);
    }

    &__ops {
        display: flex;
        gap: 10px;
    }

    code {
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(255, 255, 255, .1);
    }
}

.se-body {
    display: flex;
    min-height: 0;
    flex: 1;
}

.se-list {
    width: 268px;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, .1);

    &__bar {
        display: flex;
        gap: 6px;
        padding: 10px;
    }

    &__ul {
        flex: 1;
        margin: 0;
        padding: 0 6px 8px;
        list-style: none;
        overflow-y: auto;
    }

    &__li {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2px 8px;
        padding: 7px 9px;
        border-radius: 8px;
        cursor: pointer;
        position: relative;

        &:hover {
            background: rgba(255, 255, 255, .07);
        }

        &.is-active {
            background: rgba(255, 255, 255, .13);
        }
    }

    &__name {
        font-size: 13px;
    }

    &__kind {
        grid-column: 1;
        font-size: 11px;
        color: rgba(255, 255, 255, .5);
    }
}

.se-del {
    grid-row: 1 / span 2;
    align-self: center;
    width: 20px;
    height: 20px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, .45);
    cursor: pointer;

    &:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, .14);
    }
}

.se-empty {
    padding: 20px;
    text-align: center;
    color: rgba(255, 255, 255, .4);
    font-size: 12px;
}

.se-form {
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
    align-content: start;
}

.se-f {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: rgba(255, 255, 255, .6);

    &--full {
        grid-column: 1 / -1;
    }
}

.se-input,
select.se-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    color: rgba(255, 255, 255, .92);
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .14);
    border-radius: 8px;
    outline: none;
    resize: vertical;

    &:focus {
        border-color: rgba(255, 255, 255, .3);
        background: rgba(255, 255, 255, .09);
    }

    option {
        color: #111;
        background: #fff;
    }
}

.se-foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid rgba(255, 255, 255, .1);
}

.se-count {
    font-size: 12px;
    color: rgba(255, 255, 255, .5);
}

.se-acts {
    margin-left: auto;
    display: flex;
    gap: 8px;
}

.se-btn {
    padding: 7px 14px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: .18s;

    &--sm {
        padding: 5px 10px;
        font-size: 12px;
    }

    &--ghost {
        color: rgba(255, 255, 255, .85);
        background: rgba(255, 255, 255, .07);
        border-color: rgba(255, 255, 255, .16);

        &:hover {
            background: rgba(255, 255, 255, .13);
        }
    }

    &--primary {
        color: #0a0a0c;
        background: rgba(255, 255, 255, .92);
        font-weight: 600;

        &:hover:not(:disabled) {
            background: #fff;
        }

        &:disabled {
            opacity: .4;
            cursor: not-allowed;
        }
    }
}

.se-msg {
    margin: 0;
    padding: 0 16px 12px;
    font-size: 12px;

    &.ok {
        color: #7ee787;
    }

    &.err {
        color: #ff6b6b;
    }
}

.se-fade-enter-active,
.se-fade-leave-active {
    transition: opacity .18s ease;
}

.se-fade-enter-from,
.se-fade-leave-to {
    opacity: 0;
}
</style>