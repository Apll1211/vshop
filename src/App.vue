<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-zinc-50">
    <TheHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <TheFooter />
    <Toaster position="top-center" />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
