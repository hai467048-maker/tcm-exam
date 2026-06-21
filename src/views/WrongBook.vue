<script setup lang="ts">
import { ref, computed } from "vue"
import { useExamStore } from "@/stores/exam"
import type { Question } from "@/types"

const examStore = useExamStore()

const selectedQuestion = ref<Question | null>(null)
const showDetail = ref(false)

const wrongByCategory = computed(() => {
  const map = new Map<string, Question[]>()
  examStore.wrongQuestions.forEach(q => {
    const list = map.get(q.category) || []
    list.push(q)
    map.set(q.category, list)
  })
  return Array.from(map.entries()).map(([category, questions]) => ({
    category,
    count: questions.length,
    questions,
  }))
})

function viewQuestion(q: Question) {
  selectedQuestion.value = q
  showDetail.value = true
}

function getRecord(questionId: string) {
  return examStore.answerRecords.filter(r => r.questionId === questionId)
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
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">错题本</h1>
          <p class="mt-1 text-sm text-gray-500">收录你做错的题目，针对性复习巩固薄弱知识点</p>
        </div>
        <div v-if="examStore.wrongQuestionCount > 0" class="flex items-center gap-2">
          <span class="stat-value text-red-600">{{ examStore.wrongQuestionCount }}</span>
          <span class="stat-label">道错题</span>
        </div>
      </div>

      <div v-if="examStore.wrongQuestionCount > 0" class="mt-5 flex items-center gap-2">
        <div class="progress-bar flex-1">
          <div class="progress-fill" :style="{ width: (examStore.totalCorrect / Math.max(examStore.totalAnswered, 1)) * 100 + '%', background: 'linear-gradient(to right, #ef4444, #f97316, #22c55e)' }" />
        </div>
        <span class="text-xs text-gray-500">正确率 {{ examStore.accuracy }}%</span>
      </div>
    </div>

    <!-- 按科目分组 -->
    <div v-if="wrongByCategory.length > 0" v-for="group in wrongByCategory" :key="group.category" class="card p-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base font-semibold text-gray-900">{{ group.category }}</span>
          <span class="badge-red">{{ group.count }}题</span>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="(q, idx) in group.questions" :key="q.id" class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50" @click="viewQuestion(q)">
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600">{{ idx + 1 }}</div>
          <div class="min-w-0 flex-1">
            <p class="line-clamp-2 text-sm text-gray-900">{{ q.content }}</p>
            <div class="mt-1.5 flex flex-wrap items-center gap-2">
              <span class="badge-gray text-xs">{{ typeText(q.type) }}</span>
              <span class="text-xs text-gray-400">{{ q.knowledgePoint }}</span>
              <span v-if="q.year" class="text-xs text-gray-400">{{ q.year }}年真题</span>
            </div>
          </div>
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>

    <div v-else class="card py-12 text-center">
      <div class="text-4xl">🎉</div>
      <h3 class="mt-3 text-lg font-semibold text-gray-900">暂无错题</h3>
      <p class="mt-1 text-sm text-gray-500">你还没有做错过题目，继续保持！</p>
      <router-link to="/practice" class="btn-primary mt-4 inline-flex">开始刷题</router-link>
    </div>

    <!-- 错题详情弹窗 -->
    <Teleport to="body">
      <div v-if="showDetail && selectedQuestion" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 backdrop-blur-sm" @click.self="showDetail = false">
        <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="badge-red">错题</span>
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
                <span :class="selectedQuestion.answer.includes(opt.label) ? 'font-semibold text-green-700' : 'text-gray-700'">{{ opt.label }}. {{ opt.text }}</span>
                <span v-if="selectedQuestion.answer.includes(opt.label)" class="ml-2 text-xs text-green-600">✓ 正确答案</span>
              </div>
            </div>
            <div class="mt-4 rounded-lg bg-blue-50 p-4">
              <p class="text-xs font-medium tracking-wider text-blue-700">解析</p>
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