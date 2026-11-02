export interface SearchEngine {
    key: string
    label: string
    icon: string
    /** 关键词占位符 */
    url: string
    /** 是否新标签打开 */
    blank?: boolean
}