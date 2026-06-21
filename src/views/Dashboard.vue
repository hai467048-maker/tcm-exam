<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useExamStore } from "@/stores/exam"
import { useQuestionStore } from "@/stores/question"

const router = useRouter()
const examStore = useExamStore()
const questionStore = useQuestionStore()

const stats = computed(() => [
  { label: "已答题数", value: examStore.totalAnswered, icon: "📝", color: "text-ink-500", bg: "bg-ink-50" },
  { label: "正确率", value: examStore.accuracy + "%", icon: "✅", color: "text-green-600", bg: "bg-green-50" },
  { label: "错题本", value: examStore.wrongQuestionCount, icon: "📕", color: "text-red-600", bg: "bg-red-50" },
  { label: "连续学习", value: examStore.streakDays + "天", icon: "🔥", color: "text-ink-500", bg: "bg-warning-50" },
  { label: "今日刷题", value: examStore.todayCount, icon: "🎯", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "学习时长", value: Math.floor(examStore.totalTime / 60) + "分", icon: "⏱️", color: "text-purple-600", bg: "bg-purple-50" },
])

const quickActions = [
  { title: "随机刷题", desc: "系统随机抽取题目练习", icon: "🎲", path: "/practice", color: "bg-ink-500" },
  { title: "模拟考试", desc: "限时模拟真实考试环境", icon: "📝", path: "/exam", color: "bg-ink-500" },
  { title: "错题复习", desc: "巩固容易出错的题目", icon: "📕", path: "/wrong-book", color: "bg-red-500" },
]

const recentWrongQuestion = computed(() => {
  const wrong = examStore.wrongQuestions
  if (wrong.length === 0) return null
  return wrong[wrong.length - 1]
})
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎横幅 -->
    <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-ink-500 via-ink-600 to-ink-700 p-6 sm:p-8 text-white shadow-lg">
      <div class="relative">
        <div class="relative z-10">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">杏林题库</h1>
          <p class="mt-2 max-w-xl text-sm text-paper-200 sm:text-base">中医执业医师考试在线刷题系统 · 覆盖全部考试科目，历年真题实时更新</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <router-link to="/practice" class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink-600 shadow-sm transition-all hover:bg-ink-50 active:scale-[0.98]">
              ✍️ 开始刷题
            </router-link>
            <router-link to="/exam" class="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20 backdrop-blur-sm">
              模拟考试 →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      <div v-for="stat in stats" :key="stat.label" class="card flex flex-col items-center p-4 text-center">
        <div :class="['flex h-9 w-9 items-center justify-center rounded-lg text-lg', stat.bg]">
          {{ stat.icon }}
        </div>
        <p :class="['mt-2 stat-value', stat.color]">{{ stat.value }}</p>
        <p class="stat-label mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <!-- 快速操作 + 最近错题 -->
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- 快速操作 -->
      <div class="lg:col-span-2">
        <div class="card">
          <h2 class="mb-4 text-base font-semibold text-stone-800">快速开始</h2>
          <div class="grid gap-3 sm:grid-cols-3">
            <button
              v-for="action in quickActions"
              :key="action.title"
              @click="router.push(action.path)"
              class="group flex flex-col items-center rounded-xl border border-stone-150 p-4 text-center transition-all hover:border-stone-300 hover:shadow-md active:scale-[0.98]"
            >
              <div :class="['flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg shadow-sm', action.color]">
                {{ action.icon }}
              </div>
              <p class="mt-2 text-sm font-semibold text-stone-800">{{ action.title }}</p>
              <p class="mt-0.5 text-xs text-stone-400">{{ action.desc }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- 最近错题 -->
      <div>
        <div class="card h-full">
          <h2 class="mb-3 text-base font-semibold text-stone-800">最近错题</h2>
          <div v-if="recentWrongQuestion" class="flex flex-col">
            <div class="rounded-lg bg-red-50 p-3">
              <p class="line-clamp-2 text-sm text-stone-700">{{ recentWrongQuestion.content }}</p>
              <div class="mt-2 flex items-center justify-between">
                <span class="badge-red">{{ recentWrongQuestion.category }}</span>
                <router-link to="/wrong-book" class="text-xs font-medium text-red-600 hover:text-red-700">查看全部 →</router-link>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center py-6 text-center">
            <div class="text-3xl">🎉</div>
            <p class="mt-2 text-sm text-stone-400">暂无错题，继续保持！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 科目进度 -->
    <div class="card">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-800">科目进度</h2>
        <router-link to="/questions" class="text-sm font-medium text-ink-500 hover:text-ink-600">全部题库 →</router-link>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="cat in questionStore.categories.slice(0, 6)" :key="cat.name" class="flex items-center gap-3 rounded-lg border border-stone-100 p-3 transition-colors hover:border-stone-150">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-base">{{ cat.icon }}</div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-stone-800">{{ cat.name }}</p>
              <p class="text-xs text-stone-400">{{ cat.progress }}%</p>
            </div>
            <div class="progress-bar mt-1.5">
              <div class="progress-fill" :style="{ width: cat.progress + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>