<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProductInfo } from '@/api/types'

const props = defineProps<{
  product: ProductInfo
}>()

const router = useRouter()

// 计算折扣显示
const discountDisplay = computed(() => {
  if (props.product.originalPrice && props.product.originalPrice > props.product.price) {
    const discount = props.product.price / props.product.originalPrice
    if (discount < 1) {
      return `${Math.round(discount * 10)}折`
    }
  }
  return null
})

// 跳转到商品详情
function goToDetail() {
  router.push(`/product/${props.product.id}`)
}
</script>

<template>
  <motion.div
    :whileHover="{ y: -8, transition: { duration: 0.2 } }"
    :whilePress="{ scale: 0.98 }"
  >
    <Card
      class="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200/50 rounded-2xl bg-white"
      @click="goToDetail"
    >
      <!-- 商品图片 -->
      <div class="relative aspect-square overflow-hidden bg-slate-100">
        <img
          :src="product.defaultImg || '/images/placeholder.png'"
          :alt="product.title || product.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <!-- 折扣标签 -->
        <Badge
          v-if="discountDisplay"
          class="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-500 hover:to-red-500 text-white rounded-lg px-2 py-1"
        >
          {{ discountDisplay }}
        </Badge>
        <!-- 悬停遮罩 -->
        <div class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300" />
      </div>

      <!-- 商品信息 -->
      <CardContent class="p-4">
        <!-- 商品名称 -->
        <h3 class="text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-blue-600 transition-colors">
          {{ product.title || product.name }}
        </h3>

        <!-- 价格信息 -->
        <div class="flex items-baseline gap-2">
          <span class="text-xl font-bold text-red-500">
            ¥{{ product.price }}
          </span>
          <span
            v-if="product.originalPrice && product.originalPrice > product.price"
            class="text-xs text-slate-400 line-through"
          >
            ¥{{ product.originalPrice }}
          </span>
        </div>

        <!-- 热度 -->
        <div v-if="product.hotScore" class="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <span class="w-1 h-1 rounded-full bg-orange-400" />
          <span class="text-orange-500">热度 {{ product.hotScore }}</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
</template>
