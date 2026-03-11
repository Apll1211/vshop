<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import TheFooter from "@/components/layout/TheFooter.vue";
import TheHeader from "@/components/layout/TheHeader.vue";
import { Toaster } from "@/components/ui/sonner";

const route = useRoute();

// 判断当前是否在后台管理界面
const isAdminPage = computed(() => {
	return route.path.startsWith("/admin");
});
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

    <!-- 统一全局提示配置，确保在顶部居中且层级最高 -->
    <Toaster position="top-center" :richColors="true" :expand="true" />
  </div>
</template>

<style>
/* 全局基础重置 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
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

/* 确保 Toaster 在所有全屏覆盖层之上 */
[data-sonner-toaster] {
  z-index: 9999 !important;
}
</style>
