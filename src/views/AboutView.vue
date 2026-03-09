<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import { Home, ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-zinc-50 py-16">
    <div class="container mx-auto px-4">
      <Card class="max-w-2xl mx-auto">
        <CardContent class="p-8 text-center">
          <h1 class="text-3xl font-bold text-zinc-800 mb-4">关于南渡商城</h1>
          <p class="text-zinc-600 mb-6 leading-relaxed">
            南渡商城致力于为用户提供优质、便捷的购物体验。我们精选各类商品，确保品质与服务的双重保障。
          </p>
          <p class="text-zinc-500 text-sm mb-8">
            品质生活，从这里开始
          </p>
          <Button as-child>
            <RouterLink to="/">
              <Home class="w-4 h-4 mr-2" />
              返回首页
              <ArrowRight class="w-4 h-4 ml-2" />
            </RouterLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
