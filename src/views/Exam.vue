<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useQuestionStore } from "@/stores/question"
import { useExamStore } from "@/stores/exam"
import type { Question } from "@/types"

const router = useRouter()
const questionStore = useQuestionStore()
const examStore = useExamStore()

const step = ref<"config" | "exam" | "result">("config")
const examConfig = ref({ timeLimit: 60, questionCount: 10, category: "全部" })
const currentIndex = ref(0)
const selectedAnswers = ref<string[]>([])
const showResult = ref(false)
const timer = ref(0)
const timerInterval = ref<number>(0)
const isCorrect = ref(false)

const categories = computed(() => {
  const cats = new Set(questionStore.questions.map(q => q.category))
  return ["全部", ...Array.from(cats)]
})

const examQuestions = ref<Question[]>([])

const startExam = computed(() => {
  let qs = questionStore.questions
  if (examConfig.value.category !== "全部") {
    qs = qs.filter(q => q.category === examConfig.value.category)
  }
  const shuffled = [...qs].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(examConfig.value.questionCount, shuffled.length))
})

const currentQuestion = computed(() => examQuestions.value[currentIndex.value])

const progress = computed(() =>
  examQuestions.value.length > 0
    ? Math.round(((currentIndex.value + 1) / examQuestions.value.length) * 100)
    : 0
)

function beginExam() {
  examQuestions.value = startExam.value
  if (examQuestions.value.length === 0) return
  examStore.startExam("模拟考试", examConfig.value.category, examQuestions.value)
  currentIndex.value = 0
  selectedAnswers.value = []
  showResult.value = false
  timer.value = examConfig.value.timeLimit * 60
  step.value = "exam"
  clearInterval(timerInterval.value)
  timerInterval.value = window.setInterval(() => {
    timer.value--
    if (timer.value <= 0) finishExam()
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
    if (idx >= 0) selectedAnswers.value.splice(idx, 1)
    else selectedAnswers.value.push(label)
  }
}

function confirmAnswer() {
  if (selectedAnswers.value.length === 0 || !currentQuestion.value) return
  const result = examStore.submitAnswer(currentQuestion.value.id, selectedAnswers.value, examConfig.value.timeLimit * 60 - timer.value)
  isCorrect.value = result ?? false
  showResult.value = true
}

function nextQuestion() {
  if (currentIndex.value < examQuestions.value.length - 1) {
    currentIndex.value++
    selectedAnswers.value = []
    showResult.value = false
  } else {
    finishExam()
  }
}

function finishExam() {
  clearInterval(timerInterval.value)
  examStore.finishExam()
  step.value = "result"
}

const latestResult = computed(() => {
  const h = examStore.history
  return h.length > 0 ? h[h.length - 1] : null
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m + ":" + (s < 10 ? "0" : "") + s
}
</script>

<template>
  <div class="space-y-5">
    <!-- 考试配置 -->
    <div v-if="step === 'config'" class="card">
      <h1 class="text-xl font-bold text-gray-900">模拟考试</h1>
      <p class="mt-1 text-sm text-gray-500">限时模拟真实执业医师考试环境，检验学习成果</p>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">考试科目</label>
          <select v-model="examConfig.category" class="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat === "全部" ? "综合" : cat }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">题目数量</label>
          <select v-model="examConfig.questionCount" class="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
            <option :value="10">10 题（快速测试）</option>
            <option :value="20">20 题（小测试）</option>
            <option :value="30">30 题（标准测试）</option>
            <option :value="50">50 题（完整测试）</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">考试时长</label>
          <select v-model="examConfig.timeLimit" class="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
            <option :value="15">15 分钟</option>
            <option :value="30">30 分钟</option>
            <option :value="60">60 分钟</option>
            <option :value="120">120 分钟</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between rounded-lg bg-ink-50 p-4">
        <div>
          <p class="text-sm text-gray-700">即将开始模拟考试</p>
          <p class="text-xs text-gray-500">{{ startExam.length }} 道题目 · {{ examConfig.timeLimit }} 分钟限时</p>
        </div>
        <button :disabled="startExam.length === 0" class="btn-primary" @click="beginExam">开始考试</button>
      </div>
    </div>

    <!-- 考试进行中 -->
    <div v-else-if="step === 'exam' && currentQuestion" class="space-y-4">
      <!-- 考试信息栏 -->
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span :class="timer < 60 ? 'badge-red' : 'badge-gray'" class="font-mono text-sm">
              ⏱ {{ formatTime(timer) }}
            </span>
            <span class="text-sm text-gray-500">第 {{ currentIndex + 1 }}/{{ examQuestions.length }} 题</span>
          </div>
          <button class="text-sm text-gray-400 hover:text-red-500" @click="finishExam">交卷</button>
        </div>
        <div class="progress-bar mt-2">
          <div class="progress-fill" :style="{ width: progress + '%' }" />
        </div>
      </div>

      <!-- 题目 -->
      <div class="card">
        <div class="flex items-start gap-3">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-bold text-ink-600">{{ currentIndex + 1 }}</div>
          <p class="question-content text-base font-medium">{{ currentQuestion.content }}</p>
        </div>

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
            ]">{{ showResult && currentQuestion.answer.includes(option.label) ? "✓" : showResult && selectedAnswers.includes(option.label) && !currentQuestion.answer.includes(option.label) ? "✗" : option.label }}</span>
            <span class="text-gray-700">{{ option.text }}</span>
          </button>
        </div>

        <div class="mt-5 flex items-center gap-3">
          <button v-if="!showResult" :disabled="selectedAnswers.length === 0" class="btn-accent" @click="confirmAnswer">确认</button>
          <button v-else class="btn-accent" @click="nextQuestion">{{ currentIndex < examQuestions.length - 1 ? "下一题" : "查看成绩" }}</button>
        </div>
      </div>

      <!-- 解析 -->
      <div v-if="showResult" :class="['card border-l-4', isCorrect ? 'border-l-green-500' : 'border-l-red-500']">
        <div class="flex items-center gap-2">
          <span :class="isCorrect ? 'text-green-600' : 'text-red-600'" class="text-lg">{{ isCorrect ? "✅" : "❌" }}</span>
          <span :class="isCorrect ? 'text-green-700' : 'text-red-700'" class="font-semibold">{{ isCorrect ? "回答正确！" : "回答错误" }}</span>
        </div>
        <div class="mt-3">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">解析</p>
          <p class="explanation-content mt-1">{{ currentQuestion.explanation }}</p>
        </div>
      </div>
    </div>

    <!-- 考试结果 -->
    <div v-else-if="step === 'result' && latestResult" class="card text-center">
      <div class="py-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full" :class="(latestResult.score ?? 0) >= 60 ? 'bg-green-100' : 'bg-red-100'">
          <span :class="(latestResult.score ?? 0) >= 60 ? 'text-green-600' : 'text-red-600'" class="text-3xl font-bold">{{ latestResult.score }}</span>
        </div>
        <h2 class="mt-4 text-xl font-bold text-gray-900">考试完成！</h2>
        <p class="mt-1 text-sm text-gray-500">{{ latestResult.title }} — {{ examConfig.category === '全部' ? '综合' : examConfig.category }}</p>

        <div class="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
          <div>
            <p class="stat-value text-green-600">{{ latestResult.correctCount }}</p>
            <p class="stat-label">正确</p>
          </div>
          <div>
            <p class="stat-value text-red-600">{{ latestResult.totalQuestions - latestResult.correctCount }}</p>
            <p class="stat-label">错误</p>
          </div>
          <div>
            <p class="stat-value text-gray-700">{{ latestResult.totalQuestions }}</p>
            <p class="stat-label">总题数</p>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <button class="btn-primary" @click="step = 'config'">再测一次</button>
          <router-link to="/wrong-book" class="btn-secondary">查看错题</router-link>
          <router-link to="/analysis" class="btn-secondary">考试分析</router-link>
        </div>
      </div>
    </div>
  </div>
</template>