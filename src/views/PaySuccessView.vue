<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Home, Package, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const orderId = route.params.orderId as string

const goHome = () => {
  router.push('/')
}

const goOrders = () => {
  router.push({ name: 'orders' })
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md text-center">
      <CardContent class="p-8">
        <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 class="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 class="text-2xl font-bold text-zinc-800 mb-2">支付成功</h1>
        <p class="text-zinc-500 mb-6">您的订单已支付成功，我们将尽快为您发货</p>

        <div class="bg-zinc-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-zinc-500">订单编号</p>
          <p class="font-medium mt-1">{{ orderId }}</p>
        </div>

        <div class="flex flex-col gap-3">
          <Button @click="goOrders" class="w-full">
            <Package class="w-4 h-4 mr-2" />
            查看订单
          </Button>
          <Button variant="outline" @click="goHome" class="w-full">
            <Home class="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
