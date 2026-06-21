export interface QuestionOption {
  label: string
  text: string
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'b1' | 'case'
  category: string
  subcategory: string
  difficulty: 'easy' | 'medium' | 'hard'
  content: string
  options: QuestionOption[]
  answer: string[]
  explanation: string
  knowledgePoint: string
  year?: number
  examType?: '执业医师' | '助理医师'
}

export interface AnswerRecord {
  questionId: string
  selectedAnswers: string[]
  isCorrect: boolean
  timestamp: number
  timeSpent: number
}

export interface ExamSession {
  id: string
  title: string
  category: string
  questions: Question[]
  answers: Record<string, string[]>
  startTime: number
  endTime?: number
  score?: number
  totalQuestions: number
  correctCount: number
  completed: boolean
}

export interface KnowledgePoint {
  id: string
  title: string
  category: string
  content: string
  mastery: number
  questionCount: number
  correctRate: number
}

export interface DashboardStats {
  totalQuestions: number
  answeredQuestions: number
  correctCount: number
  wrongCount: number
  accuracy: number
  streakDays: number
  todayCount: number
  totalTime: number
}


export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    fill?: boolean
  }[]
}
export interface KnowledgeNode {
  id: string
  name: string
  level: number
  children?: KnowledgeNode[]
  highFreqPoints?: string[]
  easyMistakes?: string[]
}

export interface KnowledgeNodeFlat {
  id: string
  fullPath: string
  name: string
  level: number
  category: string
  highFreqPoints: string[]
  easyMistakes: string[]
  questionCount: number
  mastery: number
  correctRate: number
}

export interface CategoryGroup {
  name: string
  icon: string
  count: number
  progress: number
}
