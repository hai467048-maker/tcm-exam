<script setup lang="ts">
import { ref, computed } from "vue"
import { useExamStore } from "@/stores/exam"
import { useQuestionStore } from "@/stores/question"

const examStore = useExamStore()
const questionStore = useQuestionStore()

const viewMode = ref<"overview" | "categories">("overview")

// 总体统计数据
const overallStats = computed(() => {
  const total = examStore.totalAnswered
  const correct = examStore.totalCorrect
  const wrong = examStore.totalWrong
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  // 每日做题数（最近7天）
  const dailyCount: number[] = [0, 0, 0, 0, 0, 0, 0]
  const dailyLabels: string[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyLabels.push((d.getMonth() + 1) + "/" + d.getDate())
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dayEnd = dayStart + 86400000
    dailyCount[6 - i] = examStore.answerRecords.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd).length
  }

  // 科目正确率
  const catMap = new Map<string, { correct: number; total: number }>()
  examStore.answerRecords.forEach(record => {
    const q = questionStore.getQuestionById(record.questionId)
    if (!q) return
    const stat = catMap.get(q.category) || { correct: 0, total: 0 }
    stat.total++
    if (record.isCorrect) stat.correct++
    catMap.set(q.category, stat)
  })

  return { total, correct, wrong, accuracy, dailyCount, dailyLabels, catMap }
})

const categoryStats = computed(() => {
  return Array.from(overallStats.value.catMap.entries())
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
})

// 难度分析
const difficultyStats = computed(() => {
  const map = new Map<string, { correct: number; total: number }>()
  examStore.answerRecords.forEach(record => {
    const q = questionStore.getQuestionById(record.questionId)
    if (!q) return
    const stat = map.get(q.difficulty) || { correct: 0, total: 0 }
    stat.total++
    if (record.isCorrect) stat.correct++
    map.set(q.difficulty, stat)
  })
  return [
    { label: "简单", key: "easy", data: map.get("easy") || { correct: 0, total: 0 } },
    { label: "中等", key: "medium", data: map.get("medium") || { correct: 0, total: 0 } },
    { label: "困难", key: "hard", data: map.get("hard") || { correct: 0, total: 0 } },
  ]
})

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return h + "小时" + m + "分钟"
  return m + "分钟"
}

// 题库总数
const totalBank = computed(() => questionStore.questions.length)
</script>

<template>
  <div class="space-y-5">
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">考试分析</h1>
          <p class="mt-1 text-sm text-gray-500">全面了解你的学习数据，发现薄弱环节</p>
        </div>
        <div class="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button :class="viewMode === 'overview' ? 'rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm' : 'rounded-md px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700'" @click="viewMode = 'overview'">总览</button>
          <button :class="viewMode === 'categories' ? 'rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm' : 'rounded-md px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700'" @click="viewMode = 'categories'">科目</button>
        </div>
      </div>
    </div>

    <!-- 总览视图 -->
    <div v-if="viewMode === 'overview'">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card p-5">
          <p class="stat-label">已答题目</p>
          <p class="stat-value mt-1 text-gray-900">{{ overallStats.total }}</p>
          <p class="mt-1 text-xs text-gray-400">题库共 {{ totalBank }} 道</p>
        </div>
        <div class="card p-5">
          <p class="stat-label">正确率</p>
          <div class="flex items-end gap-2">
            <p :class="['stat-value mt-1', overallStats.accuracy >= 60 ? 'text-green-600' : 'text-red-600']">{{ overallStats.accuracy }}%</p>
          </div>
          <div class="progress-bar mt-2">
            <div class="progress-fill" :style="{ width: overallStats.accuracy + '%' }" />
          </div>
        </div>
        <div class="card p-5">
          <p class="stat-label">正确 / 错误</p>
          <div class="mt-1 flex items-center gap-2">
            <span class="text-xl font-bold text-green-600">{{ overallStats.correct }}</span>
            <span class="text-gray-300">/</span>
            <span class="text-xl font-bold text-red-600">{{ overallStats.wrong }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-400">学习时长 {{ formatTime(examStore.totalTime) }}</p>
        </div>
        <div class="card p-5">
          <p class="stat-label">连续学习</p>
          <div class="mt-1 flex items-center gap-2">
            <p class="stat-value text-ink-500">{{ examStore.streakDays }}</p>
            <span class="text-sm text-gray-500">天</span>
          </div>
          <p class="mt-1 text-xs text-gray-400">今日已刷 {{ examStore.todayCount }} 题</p>
        </div>
      </div>

      <!-- 每日趋势 -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900">每日刷题趋势</h3>
        <div class="mt-4 flex items-end gap-2" style="height: 120px">
          <div v-for="(count, i) in overallStats.dailyCount" :key="i" class="flex flex-1 flex-col items-center">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :style="{
                height: Math.max(count * 8, count > 0 ? 4 : 0) + 'px',
                background: count > 0 ? 'linear-gradient(to top, #3d8b3d, #5da85d)' : '#e5e7eb',
              }"
            />
            <p class="mt-1.5 text-[10px] text-gray-400">{{ overallStats.dailyLabels[i] }}</p>
            <p class="text-[10px] font-medium text-gray-600">{{ count }}</p>
          </div>
        </div>
      </div>

      <!-- 难度分析 -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900">难度分布</h3>
        <div class="mt-4 space-y-3">
          <div v-for="d in difficultyStats" :key="d.key" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-700">{{ d.label }}</span>
              <span class="text-gray-500">
                {{ d.data.total }}题
                <span v-if="d.data.total > 0" :class="d.data.correct / d.data.total >= 0.6 ? 'text-green-600' : 'text-red-600'">
                  · {{ Math.round((d.data.correct / d.data.total) * 100) }}%正确率
                </span>
              </span>
            </div>
            <div class="progress-bar">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="d.key === 'easy' ? 'bg-green-500' : d.key === 'medium' ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: d.data.total > 0 ? (d.data.correct / d.data.total) * 100 + '%' : '0%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 科目视图 -->
    <div v-else>
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900">各科目正确率</h3>
        <div class="mt-4 space-y-4">
          <div v-for="cat in categoryStats" :key="cat.name" class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-900">{{ cat.name }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ cat.correct }}/{{ cat.total }} 题</span>
                <span :class="cat.accuracy >= 60 ? 'badge-green' : 'badge-red'">{{ cat.accuracy }}%</span>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="cat.accuracy >= 60 ? 'bg-green-500' : cat.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: cat.accuracy + '%' }"
              />
            </div>
          </div>
          <div v-if="categoryStats.length === 0" class="py-6 text-center text-sm text-gray-400">
            暂无数据，开始刷题后这里将展示各科目表现
          </div>
        </div>
      </div>
    </div>
  </div>
</template>