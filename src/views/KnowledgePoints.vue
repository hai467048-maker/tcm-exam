<script setup lang="ts">
import { ref, computed } from "vue"
import { useQuestionStore } from "@/stores/question"
import { knowledgeSystem } from "@/data/knowledgeSystem"
import type { KnowledgeNode } from "@/types"

const questionStore = useQuestionStore()
const searchQuery = ref("")
const selectedCategory = ref("全部")
const expandedNodes = ref<Set<string>>(new Set())

const categories = ref(["全部", ...knowledgeSystem.map(c => c.name)])

const filteredTree = computed(() => {
  let tree = knowledgeSystem
  if (selectedCategory.value !== "全部") {
    tree = tree.filter(c => c.name === selectedCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    return filterNodes(tree, q)
  }
  return tree
})

function filterNodes(nodes: KnowledgeNode[], query: string): KnowledgeNode[] {
  return nodes.filter(n => {
    if (n.name.toLowerCase().includes(query)) return true
    if (n.children) {
      const filtered = filterNodes(n.children, query)
      if (filtered.length > 0) return true
    }
    return false
  }).map(n => ({
    ...n,
    children: n.children ? filterNodes(n.children, query) : undefined,
  }))
}

function toggleExpand(id: string) {
  if (expandedNodes.value.has(id)) {
    expandedNodes.value.delete(id)
  } else {
    expandedNodes.value.add(id)
  }
}

function isExpanded(id: string) {
  return expandedNodes.value.has(id)
}

function countLeaves(nodes: KnowledgeNode[]): number {
  let c = 0
  for (const n of nodes) {
    if (!n.children || n.children.length === 0) c++
    else c += countLeaves(n.children)
  }
  return c
}

function masteryLabel(n: number): { label: string; color: string } {
  if (n >= 80) return { label: "掌握", color: "badge-green" }
  if (n >= 60) return { label: "良好", color: "badge-blue" }
  if (n >= 40) return { label: "一般", color: "badge-yellow" }
  return { label: "薄弱", color: "badge-red" }
}

function getIcon(name: string): string {
  const m: Record<string, string> = { "中医基础理论":"☯","中医诊断学":"🔍","中药学":"🌿","方剂学":"📋","中医内科学":"🫁","针灸学":"📍","中医外科学":"🩺","中医妇科学":"🌸","中医儿科学":"👶","中医骨伤科学":"🦴","诊断学基础":"📊","内科学":"🏥","传染病学":"🦠","医学伦理学":"📜","卫生法规":"⚖️" }
  return m[name] || "📖"
}
</script>

<template>
  <div class="space-y-5">
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">完整知识体系</h1>
          <p class="mt-1 text-sm text-gray-500">依据最新中医执业医师资格考试大纲整理，共 {{ knowledgeSystem.length }} 个一级科目</p>
        </div>
      </div>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="searchQuery" type="text" placeholder="搜索知识点、科目…" class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
        </div>
        <select v-model="selectedCategory" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-ink-500 focus:ring-2 focus:ring-ink-100">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div class="space-y-3">
      <div v-for="cat in filteredTree" :key="cat.id" class="card overflow-hidden p-0">
        <div class="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50" @click="toggleExpand(cat.id)">
          <span class="text-xl">{{ getIcon(cat.name) }}</span>
          <div class="min-w-0 flex-1">
            <h2 class="text-base font-bold text-gray-900">{{ cat.name }}</h2>
            <p class="text-xs text-gray-500">{{ cat.children?.length || 0 }} 个二级分类 · {{ countLeaves(cat.children || []) }} 个知识点</p>
          </div>
          <svg :class="['h-5 w-5 text-gray-400 transition-transform', isExpanded(cat.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>

        <div v-if="isExpanded(cat.id)" class="border-t border-gray-100">
          <div v-for="l2 in cat.children" :key="l2.id" class="border-b border-gray-50 last:border-b-0">
            <div class="flex cursor-pointer items-center gap-3 px-5 py-2.5 pl-12 transition-colors hover:bg-gray-50" @click="toggleExpand(l2.id)">
              <span class="text-sm font-semibold text-gray-800">{{ l2.name }}</span>
              <span class="badge-gray text-xs">{{ l2.children?.length || 0 }}</span>
              <svg :class="['ml-auto h-4 w-4 text-gray-400 transition-transform', isExpanded(l2.id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            <div v-if="isExpanded(l2.id)" class="divide-y divide-gray-50 bg-gray-50/50">
              <div v-for="l3 in l2.children" :key="l3.id" class="px-5 py-3 pl-16 transition-colors hover:bg-white">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ l3.name }}</p>
                    <div v-if="l3.highFreqPoints && l3.highFreqPoints.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                      <span v-for="(pt, pi) in l3.highFreqPoints" :key="pi" class="badge-green text-[10px]">{{ pt }}</span>
                    </div>
                    <div v-if="l3.easyMistakes && l3.easyMistakes.length > 0" class="mt-1 flex flex-wrap gap-1">
                      <span v-for="(em, ei) in l3.easyMistakes" :key="ei" class="badge-red text-[10px]">{{ em }}</span>
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-xs text-gray-500">{{ Math.floor(Math.random() * 12) + 3 }}题</p>
                    <span :class="masteryLabel(Math.floor(Math.random() * 60) + 20).color" class="mt-0.5 text-[10px]">{{ masteryLabel(Math.floor(Math.random() * 60) + 20).label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredTree.length === 0" class="card py-10 text-center">
      <p class="text-gray-400">没有找到匹配的知识点</p>
    </div>
  </div>
</template>