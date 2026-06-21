<script setup lang="ts">
import { ref, computed } from "vue"
import { useQuestionStore } from "@/stores/question"
import { useExamStore } from "@/stores/exam"
import type { Question } from "@/types"

const questionStore = useQuestionStore()
const examStore = useExamStore()

const searchQuery = ref("")
const selectedCategory = ref("全部")
const selectedDifficulty = ref("全部")
const selectedType = ref("全部")

const categories = computed(() => {
  const cats = new Set(questionStore.questions.map(q => q.category))
  return ["全部", ...Array.from(cats)]
})

const filteredQuestions = computed(() => {
  let qs = questionStore.questions

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    qs = qs.filter(item =>
      item.content.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.knowledgePoint.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value !== "全部") qs = qs.filter(q => q.category === selectedCategory.value)
  if (selectedDifficulty.value !== "全部") qs = qs.filter(q => q.difficulty === selectedDifficulty.value)
  if (selectedType.value !== "全部") qs = qs.filter(q => q.type === selectedType.value)

  return qs
})

const answeredSet = computed(() => new Set(examStore.answerRecords.map(r => r.questionId)))
const correctSet = computed(() => {
  const s = new Set<string>()
  examStore.answerRecords.filter(r => r.isCorrect).forEach(r => s.add(r.questionId))
  return s
})
const wrongSet = computed(() => {
  const s = new Set<string>()
  examStore.answerRecords.filter(r => !r.isCorrect).forEach(r => s.add(r.questionId))
  return s
})

const selectedQuestion = ref<Question | null>(null)
const showDetail = ref(false)

function viewQuestion(q: Question) {
  selectedQuestion.value = q
  showDetail.value = true
}

function getRecord(questionId: string) {
  return examStore.answerRecords.filter(r => r.questionId === questionId)
}

function difficultyText(d: string) {
  if (d === "easy") return "简单"
  if (d === "medium") return "中等"
  return "困难"
}

function typeText(t: string) {
  if (t === "single") return "单选"
  if (t === "multiple") return "多选"
  if (t === "case") return "案例"
  return "B型"
}
</script>

<template>
  <div class="space-y-5">
    <div class="card">
      <h1 class="text-xl font-bold text-gray-900">全部题库</h1>
      <p class="mt-1 text-sm text-gray-500">浏览全部中医执业医师考试题目，支持搜索和筛选</p>

      <!-- 筛选栏 -->
      <div class="mt-5 grid gap-3 sm:grid-cols-4">
        <div class="sm:col-span-2">
          <div class="relative">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="searchQuery" type="text" placeholder="搜索题目内容、知识点…" class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
          </div>
        </div>
        <select v-model="selectedCategory" class="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
          <option value="全部">全部科目</option>
          <option v-for="cat in categories.slice(1)" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <div class="flex gap-2">
          <select v-model="selectedType" class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
            <option value="全部">全部题型</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="case">案例分析</option>
          </select>
          <select v-model="selectedDifficulty" class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
            <option value="全部">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>

      <!-- 结果统计 -->
      <div class="mt-4 text-sm text-gray-500">共 <strong class="text-gray-900">{{ filteredQuestions.length }}</strong> 道题目</div>
    </div>

    <!-- 题目列表 -->
    <div class="space-y-2.5">
      <div v-for="(q, idx) in filteredQuestions" :key="q.id" class="card flex cursor-pointer items-start gap-4 p-4 transition-all hover:border-gray-300" @click="viewQuestion(q)">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">{{ idx + 1 }}</div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-2 text-sm text-gray-900">{{ q.content }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="badge-blue">{{ typeText(q.type) }}</span>
            <span class="badge-gray">{{ q.category }}</span>
            <span :class="q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'">{{ difficultyText(q.difficulty) }}</span>
            <span v-if="answeredSet.has(q.id)" :class="correctSet.has(q.id) ? 'badge-green' : 'badge-red'">
              {{ correctSet.has(q.id) ? "✓ 已掌握" : "✗ 待复习" }}
            </span>
            <span v-if="q.year" class="text-xs text-gray-400">{{ q.year }}年真题</span>
          </div>
        </div>
        <svg class="mt-1 h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </div>

      <div v-if="filteredQuestions.length === 0" class="card py-10 text-center">
        <p class="text-gray-400">没有找到匹配的题目</p>
      </div>
    </div>

    <!-- 题目详情弹窗 -->
    <Teleport to="body">
      <div v-if="showDetail && selectedQuestion" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 backdrop-blur-sm" @click.self="showDetail = false">
        <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="badge-blue">{{ typeText(selectedQuestion.type) }}</span>
              <span class="badge-gray">{{ selectedQuestion.category }}</span>
            </div>
            <button class="text-gray-400 hover:text-gray-600" @click="showDetail = false">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6">
            <p class="text-base font-medium text-gray-900">{{ selectedQuestion.content }}</p>
            <div class="mt-4 space-y-2">
              <div v-for="opt in selectedQuestion.options" :key="opt.label" :class="['rounded-lg border p-3 text-sm', selectedQuestion.answer.includes(opt.label) ? 'border-green-300 bg-green-50' : 'border-gray-200']">
                <span :class="selectedQuestion.answer.includes(opt.label) ? 'text-green-700 font-semibold' : 'text-gray-700'">{{ opt.label }}. {{ opt.text }}</span>
                <span v-if="selectedQuestion.answer.includes(opt.label)" class="ml-2 text-green-600 text-xs">✓ 正确答案</span>
              </div>
            </div>
            <div class="mt-4 rounded-lg bg-blue-50 p-4">
              <p class="text-xs font-medium text-blue-700 uppercase tracking-wider">解析</p>
              <p class="mt-1 text-sm text-gray-700">{{ selectedQuestion.explanation }}</p>
            </div>
            <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
              <span>知识点：{{ selectedQuestion.knowledgePoint }}</span>
              <span v-if="selectedQuestion.year">• {{ selectedQuestion.year }}年真题</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>