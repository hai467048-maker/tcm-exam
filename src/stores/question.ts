import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Question, KnowledgePoint, CategoryGroup, KnowledgeNode, KnowledgeNodeFlat } from '@/types'

// 模拟题库数据
const mockQuestions: Question[] = [
  {
    id: 'q001',
    type: 'single',
    category: '中医基础理论',
    subcategory: '阴阳学说',
    difficulty: 'easy',
    content: '"阴在内，阳之守也；阳在外，阴之使也"，说明了阴阳之间的哪种关系？',
    options: [
      { label: 'A', text: '对立制约' },
      { label: 'B', text: '互根互用' },
      { label: 'C', text: '消长平衡' },
      { label: 'D', text: '相互转化' },
    ],
    answer: ['B'],
    explanation: '此句出自《素问·阴阳应象大论》，说明阴阳相互为用、相互依存的关系，即"阴为阳之基，阳为阴之用"，体现了阴阳的互根互用关系。',
    knowledgePoint: '阴阳学说的基本内容',
    year: 2023,
  },
  {
    id: 'q002',
    type: 'single',
    category: '中医基础理论',
    subcategory: '五行学说',
    difficulty: 'easy',
    content: '五行中，"木"的特性是：',
    options: [
      { label: 'A', text: '曲直' },
      { label: 'B', text: '炎上' },
      { label: 'C', text: '稼穑' },
      { label: 'D', text: '从革' },
    ],
    answer: ['A'],
    explanation: '《尚书·洪范》曰："木曰曲直"，木具有生长、升发、条达舒畅的特性。B为火之特性，C为土之特性，D为金之特性。',
    knowledgePoint: '五行学说的基本内容',
  },
  {
    id: 'q003',
    type: 'single',
    category: '方剂学',
    subcategory: '解表剂',
    difficulty: 'medium',
    content: '下列方剂中，属于辛温解表剂的是：',
    options: [
      { label: 'A', text: '银翘散' },
      { label: 'B', text: '麻黄汤' },
      { label: 'C', text: '桑菊饮' },
      { label: 'D', text: '白虎汤' },
    ],
    answer: ['B'],
    explanation: '麻黄汤由麻黄、桂枝、杏仁、甘草组成，功效发汗解表、宣肺平喘，为辛温解表之代表方。银翘散、桑菊饮为辛凉解表剂，白虎汤为清气分热剂。',
    knowledgePoint: '解表剂的分类与代表方',
    year: 2022,
  },
  {
    id: 'q004',
    type: 'single',
    category: '中药学',
    subcategory: '解表药',
    difficulty: 'medium',
    content: '既能发汗解表，又能温通经脉的药物是：',
    options: [
      { label: 'A', text: '麻黄' },
      { label: 'B', text: '桂枝' },
      { label: 'C', text: '紫苏' },
      { label: 'D', text: '荆芥' },
    ],
    answer: ['B'],
    explanation: '桂枝辛甘温，归心、肺、膀胱经，功效发汗解肌、温通经脉、助阳化气。麻黄主要发汗解表、宣肺平喘；紫苏解表散寒、行气宽中；荆芥祛风解表、透疹消疮。',
    knowledgePoint: '桂枝的功效与应用',
    year: 2023,
  },
  {
    id: 'q005',
    type: 'single',
    category: '针灸学',
    subcategory: '经络腧穴',
    difficulty: 'hard',
    content: '手太阴肺经的终止穴是：',
    options: [
      { label: 'A', text: '中府' },
      { label: 'B', text: '云门' },
      { label: 'C', text: '少商' },
      { label: 'D', text: '列缺' },
    ],
    answer: ['C'],
    explanation: '手太阴肺经起于中焦，下络大肠，还循胃口，上膈属肺。其经脉从肺系横出腋下，循上肢内侧前缘下行，止于拇指桡侧端的少商穴。中府为肺经的募穴，列缺为络穴。',
    knowledgePoint: '手太阴肺经的循行与腧穴',
    year: 2022,
  },
  {
    id: 'q006',
    type: 'single',
    category: '中医内科学',
    subcategory: '肺系病证',
    difficulty: 'hard',
    content: '治疗感冒风寒束表证，应首选的方剂是：',
    options: [
      { label: 'A', text: '银翘散' },
      { label: 'B', text: '荆防败毒散' },
      { label: 'C', text: '麻黄汤' },
      { label: 'D', text: '桂枝汤' },
    ],
    answer: ['B'],
    explanation: '感冒风寒束表证，症见恶寒重、发热轻、无汗、头痛、肢节酸痛、鼻塞声重、时流清涕、咽痒咳嗽、痰白稀薄、口不渴、舌苔薄白而润、脉浮或浮紧，治宜辛温解表，方用荆防败毒散加减。',
    knowledgePoint: '感冒的辨证论治',
    year: 2023,
  },
  {
    id: 'q007',
    type: 'single',
    category: '诊断学基础',
    subcategory: '望诊',
    difficulty: 'easy',
    content: '面色青黑，伴剧烈腹痛，多见于：',
    options: [
      { label: 'A', text: '寒证' },
      { label: 'B', text: '热证' },
      { label: 'C', text: '虚证' },
      { label: 'D', text: '瘀血证' },
    ],
    answer: ['A'],
    explanation: '面色青黑多主寒证、痛证、瘀血证。青黑兼剧烈腹痛，为寒凝气滞、经脉不通所致，属寒证范畴。',
    knowledgePoint: '望面色',
  },
  {
    id: 'q008',
    type: 'multiple',
    category: '方剂学',
    subcategory: '清热剂',
    difficulty: 'hard',
    content: '下列哪些方剂属于清热剂？',
    options: [
      { label: 'A', text: '白虎汤' },
      { label: 'B', text: '黄连解毒汤' },
      { label: 'C', text: '龙胆泻肝汤' },
      { label: 'D', text: '小青龙汤' },
    ],
    answer: ['A', 'B', 'C'],
    explanation: '白虎汤清气分热，黄连解毒汤泻火解毒，龙胆泻肝汤清肝胆实火，均为清热剂。小青龙汤属于解表化饮剂，功效温肺化饮、止咳平喘，不属于清热剂。',
    knowledgePoint: '清热剂的分类',
    year: 2021,
  },
  {
    id: 'q009',
    type: 'single',
    category: '中医基础理论',
    subcategory: '藏象',
    difficulty: 'medium',
    content: '"五脏六腑之大主"指的是：',
    options: [
      { label: 'A', text: '肝' },
      { label: 'B', text: '心' },
      { label: 'C', text: '脾' },
      { label: 'D', text: '肾' },
    ],
    answer: ['B'],
    explanation: '心主血脉，主藏神，具有主宰人体生命活动和精神意识思维活动的功能，故称心为"五脏六腑之大主"。《灵枢·邪客》曰："心者，五脏六腑之大主也，精神之所舍也。"',
    knowledgePoint: '心的生理功能',
    year: 2023,
  },
  {
    id: 'q010',
    type: 'single',
    category: '中药学',
    subcategory: '清热药',
    difficulty: 'medium',
    content: '既能清热燥湿，又能泻火解毒的药物是：',
    options: [
      { label: 'A', text: '黄芩' },
      { label: 'B', text: '黄连' },
      { label: 'C', text: '黄柏' },
      { label: 'D', text: '以上都是' },
    ],
    answer: ['D'],
    explanation: '黄芩、黄连、黄柏三药均具有清热燥湿、泻火解毒的功效。黄芩善清上焦之火，黄连善清中焦之火，黄柏善清下焦之火。三者常统称为"三黄"。',
    knowledgePoint: '清热燥湿药的共性',
    year: 2022,
  },
  {
    id: 'q011',
    type: 'case',
    category: '中医内科学',
    subcategory: '脾胃系病证',
    difficulty: 'hard',
    content: '患者李某，男，45岁。胃脘灼痛反复发作3年，近因情志不遂加重。现症：胃脘灼痛，痛势急迫，烦躁易怒，泛酸嘈杂，口干口苦，舌红苔黄，脉弦数。该患者应诊断为：',
    options: [
      { label: 'A', text: '胃痛·肝气犯胃证' },
      { label: 'B', text: '胃痛·肝胃郁热证' },
      { label: 'C', text: '胃痛·胃阴亏耗证' },
      { label: 'D', text: '胃痛·湿热中阻证' },
    ],
    answer: ['B'],
    explanation: '患者胃脘灼痛、烦躁易怒、泛酸嘈杂、口干口苦、舌红苔黄、脉弦数，为肝胃郁热之证。肝气犯胃证以胃脘胀痛、嗳气为主，无灼热感。胃阴亏耗证见胃脘隐痛、口干舌燥、舌红少津。湿热中阻证见脘腹痞闷、大便黏滞。故辨证为肝胃郁热证。',
    knowledgePoint: '胃痛的辨证论治',
    year: 2023,
  },
  {
    id: 'q012',
    type: 'single',
    category: '中医基础理论',
    subcategory: '气血津液',
    difficulty: 'easy',
    content: '具有"运行全身气血，联络脏腑肢节，沟通上下内外"功能的是：',
    options: [
      { label: 'A', text: '经络' },
      { label: 'B', text: '三焦' },
      { label: 'C', text: '血脉' },
      { label: 'D', text: '脏腑' },
    ],
    answer: ['A'],
    explanation: '经络系统遍布全身，通过有规律的循行和错综复杂的联络交会，将人体五脏六腑、四肢百骸、五官九窍、皮肉筋脉等组织器官连接成一个统一的有机整体，具有运行气血、协调阴阳、抗御病邪、反应病候的作用。',
    knowledgePoint: '经络系统的生理功能',
  },
]

const leafNodes: KnowledgeNode[] = getLeafNodes(knowledgeSystem)

const mockCategories: CategoryGroup[] = knowledgeSystem.map((cat, i) => ({
  name: cat.name,
  icon: ['☯','🔍','🌿','📋','🫁','📍','🩺','🌸','👶','🦴','📊','🏥','🦠','📜','⚖️'][i] || '📖',
  count: getLeafNodes([cat]).length * 20,
  progress: Math.floor(Math.random() * 50) + 10,
}))

export const useQuestionStore = defineStore('question', () => {
  const questions = ref<Question[]>(mockQuestions)
 const categories = ref<CategoryGroup[]>(mockCategories)
  const searchQuery = ref('')
  const selectedCategory = ref('全部')
  const selectedDifficulty = ref('全部')

  function getQuestionsByCategory(category: string): Question[] {
    if (category === '全部') return questions.value
    return questions.value.filter(q => q.category === category)
  }

  function getQuestionsByDifficulty(difficulty: string): Question[] {
    if (difficulty === '全部') return questions.value
    return questions.value.filter(q => q.difficulty === difficulty)
  }

  function searchQuestions(query: string): Question[] {
    if (!query) return questions.value
    const q = query.toLowerCase()
    return questions.value.filter(item =>
      item.content.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.knowledgePoint.toLowerCase().includes(q)
    )
  }

  function getQuestionById(id: string): Question | undefined {
    return questions.value.find(q => q.id === id)
  }

  function getKnowledgeTree() {
    return knowledgeSystem
  }

  function getFlatKnowledgePoints(): KnowledgeNodeFlat[] {
    return leafNodes.map(node => {
      const fullPath = findNodePath(knowledgeSystem, node.id)
      const category = fullPath.split(' > ')[0]
      const relatedQuestions = questions.value.filter(q => q.knowledgePoint === node.id || q.knowledgePoint.includes(node.name))
      return {
        id: node.id,
        fullPath,
        name: node.name,
        level: 3,
        category,
        highFreqPoints: node.highFreqPoints || [],
        easyMistakes: node.easyMistakes || [],
        questionCount: relatedQuestions.length || Math.floor(Math.random() * 10) + 5,
        mastery: Math.floor(Math.random() * 60) + 20,
        correctRate: Math.floor(Math.random() * 40) + 40,
      }
    })
  }

  function findNodePath(nodes: any[], targetId: string, path = ''): string {
    for (const node of nodes) {
      const currentPath = path ? path + ' > ' + node.name : node.name
      if (node.id === targetId) return currentPath
      if (node.children) {
        const found = findNodePath(node.children, targetId, currentPath)
        if (found) return found
      }
    }
    return path
  }

  return {
    categories,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    questions,
    getQuestionsByCategory,
    getQuestionsByDifficulty,
    searchQuestions,
    getQuestionById,
    getKnowledgeTree,
    getFlatKnowledgePoints,
  }
})
import { knowledgeSystem, flattenKnowledgeTree, getLeafNodes } from '@/data/knowledgeSystem'
