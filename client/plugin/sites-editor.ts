
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const TARGET = path.resolve(__dirname, '../src/config/sites.json')

export function sitesEditorPlugin(): Plugin {
    return {
        name: 'sites-editor',
        apply: 'serve', // ★ 只在 dev 生效，build 时整个插件不存在
        configureServer(server) {
            server.middlewares.use('/__sites/save', (req, res, next) => {
                if (req.method !== 'POST') return next()

                let raw = ''
                req.on('data', (c) => (raw += c))
                req.on('end', () => {
                    try {
                        const data = JSON.parse(raw)
                        if (!Array.isArray(data)) throw new Error('payload must be an array')
                        // 简单校验，防止把文件写坏
                        for (const s of data) {
                            if (!s.name || !s.link || !s.categoryId) throw new Error('字段缺失: name/link/categoryId')
                        }
                        fs.mkdirSync(path.dirname(TARGET), { recursive: true })
                        // 保留中文缩进可读，方便 git diff
                        fs.writeFileSync(TARGET, JSON.stringify(data, null, 2) + '\n', 'utf-8')
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({ ok: true, count: data.length }))
                    } catch (e: any) {
                        res.statusCode = 400
                        res.end(JSON.stringify({ ok: false, message: e.message }))
                    }
                })
            })
        },
    }
}