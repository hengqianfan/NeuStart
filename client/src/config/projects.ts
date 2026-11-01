import type { Project } from '@/types/project'
export const projects: Project[] = [
    {
        name: 'NeuNotes',
        desc: '基于 vitepress 开发的笔记网站，扩展了许多的功能：自动名词解释（字典）、',
        link: 'https://github.com/hengqianfan',
        icon: 'vitepress',
        tags: ['Vitepress', 'Vue3', 'SCSS', 'TypeScript'],
        status: 'active',
    },
    {
        name: 'HEngine',
        desc: '基于古法AI构建的个人管理系统：收支记账管理、行动任务管理、物品的精确化管理系统.',
        link: 'https://github.com/hengqianfan',
        icon: 'v2',
        tags: ['Vitepress', 'Vue3', 'SCSS', 'TypeScript'],
        status: 'wip',
    },

]
