import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExamSession, AnswerRecord, Question } from '@/types'
import { useQuestionStore } from './question'

export const useExamStore = defineStore('exam', () => {
  const currentSession = ref<ExamSession | null>(null)
  const history = ref<ExamSession[]>([])
  const answerRecords = ref<AnswerRecord[]>([])

  // 错题本
  const wrongQuestions = computed(() => {
    const wrongIds = new Set(
      answerRecords.value
        .filter(r => !r.isCorrect)
        .map(r => r.questionId)
    )
    const questionStore = useQuestionStore()
    return questionStore.questions.filter(q => wrongIds.has(q.id))
  })

  const wrongQuestionCount = computed(() => wrongQuestions.value.length)

  // 统计数据
  const totalAnswered = computed(() => answerRecords.value.length)
  const totalCorrect = computed(() => answerRecords.value.filter(r => r.isCorrect).length)
  const totalWrong = computed(() => answerRecords.value.filter(r => !r.isCorrect).length)
  const accuracy = computed(() =>
    totalAnswered.value > 0 ? Math.round((totalCorrect.value / totalAnswered.value) * 100) : 0
  )
  const todayCount = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return answerRecords.value.filter(r => r.timestamp >= today.getTime()).length
  })
  const totalTime = computed(() =>
    answerRecords.value.reduce((acc, r) => acc + r.timeSpent, 0)
  )

  // 连续学习天数
  const streakDays = computed(() => {
    if (answerRecords.value.length === 0) return 0
    const days = new Set<number>()
    answerRecords.value.forEach(r => {
      const d = new Date(r.timestamp)
      days.add(Math.floor(d.getTime() / 86400000))
    })
    const sorted = Array.from(days).sort((a, b) => b - a)
    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] - 1) streak++
      else break
    }
    return streak
  })

  function startExam(title: string, category: string, questions: Question[]) {
    currentSession.value = {
      id: `exam-${Date.now()}`,
      title,
      category,
      questions,
      answers: {},
      startTime: Date.now(),
      totalQuestions: questions.length,
      correctCount: 0,
      completed: false,
    }
  }

  function answerQuestion(questionId: string, answers: string[]) {
    if (!currentSession.value) return
    currentSession.value.answers[questionId] = answers
  }

  function submitAnswer(questionId: string, selectedAnswers: string[], timeSpent: number) {
    const questionStore = useQuestionStore()
    const question = questionStore.getQuestionById(questionId)
    if (!question) return

    const isCorrect =
      JSON.stringify(selectedAnswers.sort()) === JSON.stringify(question.answer.sort())

    const record: AnswerRecord = {
      questionId,
      selectedAnswers,
      isCorrect,
      timestamp: Date.now(),
      timeSpent,
    }
    answerRecords.value.push(record)

    if (currentSession.value) {
      if (isCorrect) currentSession.value.correctCount++
      currentSession.value.answers[questionId] = selectedAnswers
    }

    return isCorrect
  }

  function finishExam() {
    if (!currentSession.value) return
    currentSession.value.endTime = Date.now()
    currentSession.value.completed = true
    currentSession.value.score = Math.round(
      (currentSession.value.correctCount / currentSession.value.totalQuestions) * 100
    )
    history.value.push(currentSession.value)
    currentSession.value = null
  }

  function clearWrongQuestions() {
    const correctIds = new Set(
      answerRecords.value.filter(r => r.isCorrect).map(r => r.questionId)
    )
    answerRecords.value = answerRecords.value.filter(r => !correctIds.has(r.questionId))
  }

  return {
    currentSession,
    history,
    answerRecords,
    wrongQuestions,
    wrongQuestionCount,
    totalAnswered,
    totalCorrect,
    totalWrong,
    accuracy,
    todayCount,
    totalTime,
    streakDays,
    startExam,
    answerQuestion,
    submitAnswer,
    finishExam,
    clearWrongQuestions,
  }
})
