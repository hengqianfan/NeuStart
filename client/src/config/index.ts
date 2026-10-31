interface MyConfig {
    author: string
    intro: string
    siteName: string
    socials: SocialItem[]
}

interface SocialItem {
    label: string
    sub: string
    href: string
    icon: string
}


export const myConfig: MyConfig = {
    author: '衡千帆',
    intro: '我？非先天性的中度社恐人士，无害型快乐宅男，技术发烧佬，乐于在不同的领域内贡献一些并没有什么毛用的东西。',
    siteName: 'NeuStart',
    socials: [
        { label: 'GitHub', sub: '我的代码仓库', href: 'https://github.com/hengqianfan', icon: 'github' },
        { label: '小黑盒', sub: '游戏社区', href: '', icon: 'heihe' },
        { label: 'NeuNotes', sub: '我的笔记库', href: '', icon: 'note' }
        // { label: '掘金', sub: '技术文章', href: 'https://juejin.cn/', icon: 'juejin' },
        // { label: '知乎', sub: '问答与专栏', href: 'https://www.zhihu.com/', icon: 'zhihu' },
        // { label: 'X', sub: '@your_name', href: 'https://x.com/', icon: 'twitter' },
        // { label: '邮箱', sub: 'you@example.com', href: 'mailto:you@example.com', icon: 'mail' },
        // { label: '博客', sub: 'blog.example.com', href: 'https://example.com/', icon: 'link' },
    ]
}