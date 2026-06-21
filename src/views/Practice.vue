<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useQuestionStore } from "@/stores/question"
import { useExamStore } from "@/stores/exam"
import type { Question } from "@/types"

const questionStore = useQuestionStore()
const examStore = useExamStore()

const currentIndex = ref(0)
const selectedAnswers = ref<string[]>([])
const showResult = ref(false)
const isCorrect = ref(false)
const currentTimer = ref(0)
const timerInterval = ref<number>(0)
const selectedCategory = ref("全部")
const selectedDifficulty = ref("全部")
const sessionStarted = ref(false)

const filteredQuestions = computed(() => {
  let qs = questionStore.questions
  if (selectedCategory.value !== "全部") {
    qs = qs.filter(q => q.category === selectedCategory.value)
  }
  if (selectedDifficulty.value !== "全部") {
    qs = qs.filter(q => q.difficulty === selectedDifficulty.value)
  }
  return qs
})

const currentQuestion = computed(() => filteredQuestions.value[currentIndex.value])

const progress = computed(() =>
  filteredQuestions.value.length > 0
    ? Math.round(((currentIndex.value + 1) / filteredQuestions.value.length) * 100)
    : 0
)

const categories = computed(() => {
  const cats = new Set(questionStore.questions.map(q => q.category))
  return ["全部", ...Array.from(cats)]
})

function startSession() {
  currentIndex.value = 0
  selectedAnswers.value = []
  showResult.value = false
  currentTimer.value = 0
  sessionStarted.value = true
  clearInterval(timerInterval.value)
  timerInterval.value = window.setInterval(() => {
    currentTimer.value++
  }, 1000)
}

function toggleOption(label: string) {
  if (showResult.value) return
  const q = currentQuestion.value
  if (!q) return

  if (q.type === "single" || q.type === "case") {
    selectedAnswers.value = [label]
  } else {
    const idx = selectedAnswers.value.indexOf(label)
    if (idx >= 0) {
      selectedAnswers.value.splice(idx, 1)
    } else {
      selectedAnswers.value.push(label)
    }
  }
}

function confirmAnswer() {
  if (selectedAnswers.value.length === 0 || !currentQuestion.value) return
  const result = examStore.submitAnswer(currentQuestion.value.id, selectedAnswers.value, currentTimer.value)
  isCorrect.value = result ?? false
  showResult.value = true
  clearInterval(timerInterval.value)
}

function nextQuestion() {
  if (currentIndex.value < filteredQuestions.value.length - 1) {
    currentIndex.value++
    selectedAnswers.value = []
    showResult.value = false
    currentTimer.value = 0
    timerInterval.value = window.setInterval(() => {
      currentTimer.value++
    }, 1000)
  } else {
    sessionStarted.value = false
    currentIndex.value = 0
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m + "分" + (s < 10 ? "0" : "") + s + "秒"
}

watch(sessionStarted, (val) => {
  if (!val) clearInterval(timerInterval.value)
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="!sessionStarted" class="space-y-4">
      <div class="card">
        <h1 class="text-xl font-bold text-gray-900">刷题模式</h1>
        <p class="mt-1 text-sm text-gray-500">按科目和难度筛选题目，逐题练习并查看详细解析</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">选择科目</label>
            <select v-model="selectedCategory" class="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">题目难度</label>
            <select v-model="selectedDifficulty" class="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
              <option value="全部">全部难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <p class="text-sm text-gray-600">当前题库：<strong class="text-gray-900">{{ filteredQuestions.length }}</strong> 道题</p>
            <p class="text-xs text-gray-400" v-if="selectedCategory !== '全部'">科目：{{ selectedCategory }}</p>
          </div>
          <button :disabled="filteredQuestions.length === 0" class="btn-primary" @click="startSession">
            开始刷题
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentQuestion" class="space-y-4">
      <!-- 进度条 -->
      <div class="card p-4">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-3">
            <span class="badge-blue">{{ currentQuestion.type === "single" ? "单选题" : currentQuestion.type === "multiple" ? "多选题" : currentQuestion.type === "case" ? "案例分析" : "B型题" }}</span>
            <span class="text-gray-500">{{ currentQuestion.category }} · {{ currentQuestion.subcategory }}</span>
            <span :class="currentQuestion.difficulty === 'easy' ? 'badge-green' : currentQuestion.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'">
              {{ currentQuestion.difficulty === "easy" ? "简单" : currentQuestion.difficulty === "medium" ? "中等" : "困难" }}
            </span>
          </div>
          <span class="text-gray-400">{{ currentIndex + 1 }}/{{ filteredQuestions.length }}</span>
        </div>
        <div class="progress-bar mt-2">
          <div class="progress-fill" :style="{ width: progress + '%' }" />
        </div>
      </div>

      <!-- 题目 -->
      <div class="card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-bold text-ink-600">{{ currentIndex + 1 }}</div>
            <p class="question-content text-base font-medium">{{ currentQuestion.content }}</p>
          </div>
          <div class="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
            {{ formatTime(currentTimer) }}
          </div>
        </div>

        <!-- 选项 -->
        <div class="mt-5 space-y-2.5">
          <button
            v-for="option in currentQuestion.options"
            :key="option.label"
            :class="[
              'option-btn',
              { selected: selectedAnswers.includes(option.label) && !showResult },
              { correct: showResult && currentQuestion.answer.includes(option.label) },
              { wrong: showResult && selectedAnswers.includes(option.label) && !currentQuestion.answer.includes(option.label) },
            ]"
            @click="toggleOption(option.label)"
          >
            <span :class="[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold',
              selectedAnswers.includes(option.label) && !showResult ? 'bg-ink-500 text-paper-100' : 'bg-gray-100 text-gray-600',
              showResult && currentQuestion.answer.includes(option.label) ? 'bg-green-500 text-white' : '',
              showResult && selectedAnswers.includes(option.label) && !currentQuestion.answer.includes(option.label) ? 'bg-red-500 text-white' : '',
            ]">
              {{ showResult && currentQuestion.answer.includes(option.label) ? "✓" : showResult && selectedAnswers.includes(option.label) && !currentQuestion.answer.includes(option.label) ? "✗" : option.label }}
            </span>
            <span class="text-gray-700">{{ option.text }}</span>
          </button>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-5 flex items-center gap-3">
          <button v-if="!showResult" :disabled="selectedAnswers.length === 0" class="btn-primary" @click="confirmAnswer">
            确认答案
          </button>
          <button v-else class="btn-accent" @click="nextQuestion">
            {{ currentIndex < filteredQuestions.length - 1 ? "下一题" : "完成练习" }}
          </button>
        </div>
      </div>

      <!-- 解析 -->
      <div v-if="showResult" :class="['card border-l-4', isCorrect ? 'border-l-green-500' : 'border-l-red-500']">
        <div class="flex items-center gap-2">
          <span :class="isCorrect ? 'text-green-600' : 'text-red-600'" class="text-lg">{{ isCorrect ? "✅" : "❌" }}</span>
          <span :class="isCorrect ? 'text-green-700' : 'text-red-700'" class="font-semibold">
            {{ isCorrect ? "回答正确！" : "回答错误" }}
          </span>
        </div>
        <div class="mt-3">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">解析</p>
          <p class="explanation-content mt-1">{{ currentQuestion.explanation }}</p>
        </div>
        <div class="mt-2">
          <p class="text-xs text-gray-400">知识点：{{ currentQuestion.knowledgePoint }}</p>
          <p v-if="currentQuestion.year" class="text-xs text-gray-400">来源：{{ currentQuestion.year }}年真题</p>
        </div>
      </div>
    </div>
  </div>
</template>