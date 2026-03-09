<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-vue-next'
import { getOrderList } from '@/api/order'
import { useUserStore } from '@/stores/user'
import type { OrderInfo } from '@/api/types'

const router = useRouter()
const userStore = useUserStore()

const orders = ref<OrderInfo[]>([])
const loading = ref(true)
const currentStatus = ref('all')

const formatPrice = (price: string | number) => {
  const p = typeof price === 'string' ? parseFloat(price) : price
  return (p / 100).toFixed(2)
}

const getStatusBadge = (order: OrderInfo) => {
  if (order.orderStatus === 'UNPAID') {
    return { variant: 'outline' as const, text: '待支付', class: 'border-amber-500 text-amber-600' }
  } else if (order.orderStatus === 'PAID') {
    return { variant: 'default' as const, text: '已支付', class: '' }
  } else if (order.orderStatus === 'SHIPPED') {
    return { variant: 'secondary' as const, text: '已发货', class: '' }
  } else if (order.orderStatus === 'COMPLETED') {
    return { variant: 'outline' as const, text: '已完成', class: 'border-emerald-500 text-emerald-600' }
  } else if (order.orderStatus === 'CANCELLED') {
    return { variant: 'destructive' as const, text: '已取消', class: '' }
  }
  return { variant: 'outline' as const, text: '未知', class: '' }
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await getOrderList() as any
    if (res) {
      orders.value = res.data?.records || []
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePay = (orderId: string) => {
  router.push({ name: 'pay', params: { orderId } })
}

const handleViewDetail = (orderId: string) => {
  router.push({ name: 'order-detail', params: { orderId } })
}

const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') return orders.value
  if (currentStatus.value === 'unpaid') return orders.value.filter(o => o.orderStatus === 'UNPAID')
  if (currentStatus.value === 'shipped') return orders.value.filter(o => o.orderStatus === 'SHIPPED')
  if (currentStatus.value === 'completed') return orders.value.filter(o => o.orderStatus === 'COMPLETED')
  return orders.value
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/orders' } })
    return
  }
  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center gap-3 mb-6">
        <Package class="w-6 h-6 text-emerald-600" />
        <h1 class="text-2xl font-bold text-zinc-800">我的订单</h1>
      </div>

      <Tabs v-model="currentStatus" class="w-full">
        <TabsList class="w-full justify-start mb-6">
          <TabsTrigger value="all">全部订单</TabsTrigger>
          <TabsTrigger value="unpaid">待支付</TabsTrigger>
          <TabsTrigger value="shipped">已发货</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>

        <!-- 加载中 -->
        <div v-if="loading" class="space-y-4">
          <Card v-for="i in 3" :key="i" class="animate-pulse">
            <CardContent class="p-6">
              <div class="h-4 bg-zinc-200 rounded w-1/4 mb-4" />
              <div class="h-20 bg-zinc-200 rounded" />
            </CardContent>
          </Card>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
          <ShoppingBag class="w-24 h-24 mx-auto text-zinc-200 mb-6" />
          <p class="text-zinc-500">暂无订单</p>
          <Button class="mt-4" @click="router.push('/')">去购物</Button>
        </div>

        <!-- 订单列表 -->
        <div v-else class="space-y-4">
          <Card v-for="order in filteredOrders" :key="order.id" class="hover:shadow-md transition-shadow">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-zinc-500">订单号: {{ order.orderNo }}</span>
                  <span class="text-sm text-zinc-500">{{ order.createTime }}</span>
                </div>
                <Badge :variant="getStatusBadge(order).variant" :class="getStatusBadge(order).class">
                  {{ getStatusBadge(order).text }}
                </Badge>
              </div>
              
              <div class="space-y-3">
                <div v-for="item in order.orderDetailList" :key="item.id" class="flex gap-4">
                  <img :src="item.imgUrl || '/placeholder.png'" class="w-16 h-16 rounded-lg object-cover" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-zinc-800 line-clamp-1">{{ item.skuName }}</p>
                    <p class="text-sm text-zinc-500 mt-1">数量: {{ item.skuNum }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">¥{{ formatPrice(item.skuPrice) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-4 pt-4 border-t">
                <div class="text-sm">
                  共 {{ order.orderDetailList.length }} 件商品，合计:
                  <span class="text-lg font-bold text-rose-500">¥{{ formatPrice(order.totalAmount) }}</span>
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" @click="handleViewDetail(order.id)">
                    查看详情
                  </Button>
                  <Button v-if="order.orderStatus === 'UNPAID'" @click="handlePay(order.id)">
                    立即支付
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  </div>
</template>