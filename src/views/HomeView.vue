<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'
import {
  ChevronRight,
  Zap,
  Gift,
  Truck,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/ProductCard.vue'
import PixelSnow from '@/components/effects/PixelSnow.vue'
import { searchProducts } from '@/api/product'
import type { ProductInfo } from '@/api/types'

const router = useRouter()

const hotProducts = ref<ProductInfo[]>([])

// 动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

onMounted(async () => {
  // 加载商品数据
  try {
    const hotRes = await searchProducts({ keyword: '热销', pageSize: 10 })
    hotProducts.value = hotRes.data?.data || []
  } catch (e) {
    console.log('加载热门商品失败')
  }
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero 区域 -->
    <section class="relative overflow-hidden min-h-[500px] lg:min-h-[520px] bg-black">
      <!-- 像素雪花背景 -->
      <PixelSnow
        color="#ffffff"
        :flakeSize="0.01"
        :minFlakeSize="1.25"
        :pixelResolution="200"
        :speed="1.25"
        :density="0.3"
        :direction="125"
        :brightness="1"
      />
      
      <div class="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- 左侧动态公告 -->
          <motion.div
            initial="hidden"
            animate="visible"
            :variants="containerVariants"
            class="hidden lg:block"
          >
            <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden h-full">
              <CardContent class="p-0 h-full flex flex-col">
                <div class="bg-black/20 px-4 py-3 border-b border-white/10">
                  <h3 class="text-white font-semibold flex items-center gap-2">
                    <Sparkles class="w-4 h-4 animate-pulse" />
                    今日速递
                  </h3>
                </div>
                <!-- 公告列表 -->
                <div class="flex-1 p-4 space-y-4">
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-0.5 bg-red-500/80 text-white text-xs rounded-full">限时</span>
                      <span class="text-white/60 text-xs">2小时前</span>
                    </div>
                    <p class="text-white/90 text-sm">限时特惠! 全场满199减50, 仅限今日!</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-0.5 bg-green-500/80 text-white text-xs rounded-full">新品</span>
                      <span class="text-white/60 text-xs">4小时前</span>
                    </div>
                    <p class="text-white/90 text-sm">2024春季新款上线, 首发特惠8折起</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-0.5 bg-blue-500/80 text-white text-xs rounded-full">活动</span>
                      <span class="text-white/60 text-xs">6小时前</span>
                    </div>
                    <p class="text-white/90 text-sm">邀请好友得红包, 最高可领100元</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-0.5 bg-yellow-500/80 text-white text-xs rounded-full">公告</span>
                      <span class="text-white/60 text-xs">1天前</span>
                    </div>
                    <p class="text-white/90 text-sm">平台服务升级, 配送范围扩大至全国</p>
                  </div>
                </div>
                <!-- 底部快捷入口 -->
                <div class="p-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                    @click="router.push({ path: '/search', query: { keyword: '热销' } })"
                  >
                    <TrendingUp class="w-3 h-3 mr-1" />
                    热销榜
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                    @click="router.push({ path: '/search', query: { keyword: '新品' } })"
                  >
                    <Sparkles class="w-3 h-3 mr-1" />
                    新品尝鲜
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <!-- 主 Banner 区域 -->
          <motion.div 
            :initial="{ opacity: 1, scale: 0.98, y: 10 }"
            :animate="{ opacity: 1, scale: 1, y: 0 }"
            :transition="{ duration: 0.5, ease: 'easeOut' }"
            class="lg:col-span-2"
          >
            <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl h-full min-h-[300px] lg:min-h-[420px] overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <CardContent class="p-8 lg:p-12 h-full flex flex-col justify-center relative">
                <Badge class="w-fit mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm rounded-lg px-3 py-1">
                  新品首发
                </Badge>
                <h1 class="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  品质生活<br />
                  <span class="text-white/80">从这里开始</span>
                </h1>
                <p class="text-white/60 text-lg mb-6 max-w-md">
                  精选全球优质商品，为您打造极致购物体验
                </p>
                <Button
                  size="lg"
                  class="w-fit bg-white text-neutral-900 hover:bg-white/90 rounded-xl px-8"
                  @click="router.push({ path: '/search' })"
                >
                  立即探索
                  <ArrowRight class="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <!-- 右侧快捷入口 -->
          <motion.div 
            initial="hidden"
            animate="visible"
            :variants="containerVariants"
            class="space-y-4"
          >
            <motion.div :variants="itemVariants">
              <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/15 transition-colors group">
                <CardContent class="p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap class="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h4 class="text-white font-medium">限时闪购</h4>
                    <p class="text-white/60 text-sm">低至3折起</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div :variants="itemVariants">
              <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/15 transition-colors group">
                <CardContent class="p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Gift class="w-6 h-6 text-pink-300" />
                  </div>
                  <div>
                    <h4 class="text-white font-medium">新人专享</h4>
                    <p class="text-white/60 text-sm">首单立减50元</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div :variants="itemVariants">
              <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/15 transition-colors group">
                <CardContent class="p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Truck class="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <h4 class="text-white font-medium">极速配送</h4>
                    <p class="text-white/60 text-sm">次日达服务</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div :variants="itemVariants">
              <Card class="bg-white/10 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/15 transition-colors group">
                <CardContent class="p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Shield class="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h4 class="text-white font-medium">正品保障</h4>
                    <p class="text-white/60 text-sm">假一赔十</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- 热门推荐 -->
    <section class="py-12 lg:py-16 bg-slate-50">
      <div class="container mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          :viewport="{ once: true }"
          :variants="containerVariants"
        >
          <motion.div :variants="itemVariants" class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <TrendingUp class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-2xl lg:text-3xl font-bold text-slate-900">热门推荐</h2>
                <p class="text-sm text-slate-500">精选热销好物</p>
              </div>
            </div>
            <Button variant="ghost" class="text-blue-600 hover:text-blue-700 hover:bg-blue-50" @click="router.push({ path: '/search', query: { keyword: '热销' } })">
              查看更多
              <ChevronRight class="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          <div v-if="hotProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            <motion.div
              v-for="product in hotProducts"
              :key="product.id"
              :variants="itemVariants"
            >
              <ProductCard :product="product" />
            </motion.div>
          </div>
          <div v-else class="text-center py-12 text-slate-500">
            暂无热门商品
          </div>
        </motion.div>
      </div>
    </section>

    <!-- 服务保障 -->
    <section class="py-12 lg:py-16 bg-white border-t border-slate-100">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            :viewport="{ once: true }"
            :variants="itemVariants"
            class="text-center"
          >
            <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Truck class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">极速配送</h3>
            <p class="text-sm text-slate-500">全国大部分地区次日达</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            :viewport="{ once: true }"
            :variants="itemVariants"
            class="text-center"
          >
            <div class="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <Shield class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">正品保障</h3>
            <p class="text-sm text-slate-500">100%正品假一赔十</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            :viewport="{ once: true }"
            :variants="itemVariants"
            class="text-center"
          >
            <div class="w-16 h-16 mx-auto rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
              <Gift class="w-8 h-8 text-pink-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">优惠多多</h3>
            <p class="text-sm text-slate-500">每日优惠享不停</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            :viewport="{ once: true }"
            :variants="itemVariants"
            class="text-center"
          >
            <div class="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <Zap class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">闪电退款</h3>
            <p class="text-sm text-slate-500">极速退款无需等待</p>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
</template>