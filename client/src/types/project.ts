export interface Project {
    name: string
    desc: string
    link: string
    /** 图标文件名（拼 CDN）或完整 URL */
    icon?: string
    tags?: string[]
    status?: 'active' | 'wip' | 'paused' | 'archived'
    featured?: boolean
}