import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import About from '@/views/About.vue'
import Sites from '@/views/Sites.vue'
import Project from '@/views/Project.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/sites',
      name: 'sites',
      component: Sites
    },
    {
      path: '/project',
      name: 'project',
      component: Project
    },

  ],
})

export default router
