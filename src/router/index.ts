import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/practice',
      name: '刷题',
      component: () => import('@/views/Practice.vue'),
      meta: { title: '刷题模式' },
    },
    {
      path: '/exam',
      name: '模拟考试',
      component: () => import('@/views/Exam.vue'),
      meta: { title: '模拟考试' },
    },
    {
      path: '/questions',
      name: '题库',
      component: () => import('@/views/QuestionBank.vue'),
      meta: { title: '全部题库' },
    },
    {
      path: '/wrong-book',
      name: '错题本',
      component: () => import('@/views/WrongBook.vue'),
      meta: { title: '错题本' },
    },
    {
      path: '/knowledge',
      name: '知识点',
      component: () => import('@/views/KnowledgePoints.vue'),
      meta: { title: '知识点' },
    },
    {
      path: '/analysis',
      name: '考试分析',
      component: () => import('@/views/Analysis.vue'),
      meta: { title: '考试分析' },
    },
  ],
})

export default router
