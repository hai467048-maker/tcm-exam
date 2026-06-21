<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const mobileMenuOpen = ref(false)

interface NavItem {
  name: string
  path: string
  icon: string
}

const navItems: NavItem[] = [
  { name: "学习首页", path: "/", icon: "📊" },
  { name: "刷题模式", path: "/practice", icon: "✍️" },
  { name: "模拟考试", path: "/exam", icon: "📝" },
  { name: "全部题库", path: "/questions", icon: "📚" },
  { name: "错题本", path: "/wrong-book", icon: "📕" },
  { name: "知识点", path: "/knowledge", icon: "🧠" },
  { name: "考试分析", path: "/analysis", icon: "📈" },
]

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/"
  return route.path.startsWith(path)
}
</script>

<template>
  <div
    v-if="mobileMenuOpen"
    class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
    @click="mobileMenuOpen = false"
  />

  <button
    class="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-stone-150 lg:hidden"
    @click="mobileMenuOpen = !mobileMenuOpen"
  >
    <svg class="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <aside
    :class="[
      'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-stone-150 bg-white transition-transform duration-300 lg:translate-x-0',
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex h-16 items-center gap-3 border-b border-stone-150 px-5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-500 text-lg text-paper-100 shadow-sm">杏</div>
      <div>
        <h1 class="text-base font-bold text-stone-800">杏林题库</h1>
        <p class="text-[11px] text-stone-400">中医执业医师考试</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-3">
      <div class="space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['sidebar-link group', { active: isActive(item.path) }]"
          @click="mobileMenuOpen = false"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
          <span v-if="isActive(item.path)" class="ml-auto h-1.5 w-1.5 rounded-full bg-ink-500" />
        </router-link>
      </div>
    </nav>

    <div class="border-t border-stone-150 p-3">
      <div class="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-ink-500 text-xs font-bold text-paper-100">U</div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-stone-800">中医考生</p>
          <p class="text-xs text-stone-400">执业医师备考</p>
        </div>
      </div>
    </div>
  </aside>
</template>