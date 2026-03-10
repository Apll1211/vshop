<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()

// 判断当前是否在后台管理界面
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-900">
    <!-- 后台管理界面 -->
    <template v-if="isAdminPage">
      <main class="flex-1 flex flex-col">
        <RouterView />
      </main>
    </template>

    <!-- 前台商城界面 -->
    <template v-else>
      <TheHeader />
      <main class="flex-1 bg-zinc-50">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
      <TheFooter />
    </template>

    <Toaster position="top-center" />
  </div>
</template>

<style>
/* 全局基础重置 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #0f172a; /* bg-slate-900 */
}

#app {
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
