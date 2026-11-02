import type { SearchEngine } from '@/types/engine'

export const engines: [SearchEngine, ...SearchEngine[]] = [
    { key: 'bing', label: '必应', icon: 'bing', url: 'https://www.bing.com/search?q=%s', blank: true },
    { key: 'google', label: 'Google', icon: 'google', url: 'https://www.google.com/search?q=%s', blank: true },
    { key: 'bilibili', label: '哔哩哔哩', icon: 'bilibili', url: 'https://search.bilibili.com/all?keyword=%s', blank: true },
    { key: 'youtube', label: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/results?search_query=%s', blank: true },
    { key: 'github', label: 'GitHub', icon: 'github', url: 'https://github.com/search?q=%s', blank: true },
    { key: 'juejin', label: '掘金', icon: 'juejin', url: 'https://juejin.cn/search?query=%s', blank: true },
    { key: 'baidu', label: '百度', icon: 'baidu', url: 'https://www.baidu.com/s?wd=%s', blank: true },
    { key: 'zhihu', label: '知乎', icon: 'zhihu', url: 'https://www.zhihu.com/search?type=content&q=%s', blank: true },
    { key: 'twitter', label: 'X', icon: 'twitter', url: 'https://x.com/search?q=%s', blank: true },

]
