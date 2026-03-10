<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-vue-next'
import { searchProducts } from '@/api'
import { useCartStore } from '@/stores/cart'
import { toast } from 'vue-sonner'
import type { ProductInfo } from '@/api/types'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const keyword = ref('')
const products = ref<ProductInfo[]>([])
const loading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

// 分页
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 筛选
const sortOrder = ref<string>('default')

const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

const fetchData = async () => {
  loading.value = true
  try {
    // 如果没有关键词,不发送请求,显示空状态
    if (!keyword.value || keyword.value.trim() === '') {
      products.value = []
      total.value = 0
      loading.value = false
      return
    }
    
    const res = await searchProducts({
      keyword: keyword.value,
      pageNo: page.value,
      pageSize: pageSize.value,
      order: sortOrder.value !== 'default' ? sortOrder.value : undefined,
    })
    if (res) {
      const data = res as any
      products.value = data.data || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  keyword.value = route.query.keyword as string || ''
  page.value = parseInt(route.query.page as string) || 1
  fetchData()
})

watch(
  () => route.query,
  (newQuery) => {
    keyword.value = newQuery.keyword as string || ''
    page.value = parseInt(newQuery.page as string) || 1
    fetchData()
  }
)

const handleSearch = () => {
  page.value = 1
  router.push({
    path: '/search',
    query: {
      keyword: keyword.value,
      page: 1,
    },
  })
}

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  router.push({
    path: '/search',
    query: {
      ...route.query,
      page: newPage,
    },
  })
}

const handleFilter = () => {
  page.value = 1
  fetchData()
}

const goToDetail = (id: number) => {
  router.push({ name: 'product-detail', params: { id } })
}

const handleQuickSearch = (searchKeyword: string) => {
  keyword.value = searchKeyword
  handleSearch()
}

const addToCart = async (productId: number) => {
  try {
    await cartStore.addToCartAction(String(productId), 1)
    toast.success('已添加到购物车')
  } catch (error) {
    toast.error('添加失败')
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50">

    <div class="container mx-auto px-4 py-6">
      <!-- 工具栏 -->
      <div class="flex items-center justify-between mb-4">
        <p v-if="keyword" class="text-sm text-zinc-500">
          搜索 "<span class="text-zinc-800 font-medium">{{ keyword }}</span>"
          共找到 <span class="text-emerald-600 font-medium">{{ total }}</span> 件商品
        </p>
        <p v-else class="text-sm text-zinc-500">
          请输入关键词开始搜索
        </p>
        <div class="flex items-center gap-3">
          <!-- 排序方式 -->
          <Select v-model="sortOrder" @update:model-value="handleFilter">
            <SelectTrigger class="w-32 h-8 text-sm">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认排序</SelectItem>
              <SelectItem value="price_asc">价格↑</SelectItem>
              <SelectItem value="price_desc">价格↓</SelectItem>
              <SelectItem value="sales">销量优先</SelectItem>
            </SelectContent>
          </Select>
          
          <!-- 视图切换 -->
          <div class="flex items-center border rounded-md">
            <Button
              :variant="viewMode === 'grid' ? 'default' : 'ghost'"
              size="icon"
              class="h-8 w-8 rounded-r-none"
              @click="viewMode = 'grid'"
            >
              <Grid3X3 class="w-4 h-4" />
            </Button>
            <Button
              :variant="viewMode === 'list' ? 'default' : 'ghost'"
              size="icon"
              class="h-8 w-8 rounded-l-none"
              @click="viewMode = 'list'"
            >
              <List class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

          <!-- 加载中 -->
          <div v-if="loading" class="grid grid-cols-1 gap-4" :class="viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''">
            <Card v-for="i in 6" :key="i" class="overflow-hidden">
              <div class="aspect-square bg-zinc-200 animate-pulse" />
              <CardContent class="p-4">
                <div class="h-4 bg-zinc-200 rounded animate-pulse mb-2" />
                <div class="h-4 bg-zinc-200 rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          </div>

          <!-- 空状态 -->
          <div v-else-if="products.length === 0" class="text-center py-16">
            <Search v-if="!keyword" class="w-24 h-24 mx-auto text-zinc-200 mb-6" />
            <Package v-else class="w-24 h-24 mx-auto text-zinc-200 mb-6" />
            <p v-if="!keyword" class="text-zinc-500 mb-4">请输入关键词搜索商品</p>
            <p v-else class="text-zinc-500">没有找到 "{{ keyword }}" 相关商品</p>
            <div v-if="!keyword" class="flex justify-center gap-2 mt-4">
              <Button variant="outline" @click="handleQuickSearch('热销')">热销商品</Button>
              <Button variant="outline" @click="handleQuickSearch('新品')">新品上架</Button>
            </div>
            <Button v-else variant="outline" class="mt-4" @click="keyword = ''">清除搜索</Button>
          </div>

          <!-- 网格视图 -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              v-for="product in products"
              :key="product.id"
              class="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
              @click="goToDetail(product.id)"
            >
              <div class="aspect-square bg-zinc-100 relative overflow-hidden">
                <img
                  :src="product.defaultImg || '/placeholder.png'"
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div class="absolute top-2 left-2">
                  <Badge v-if="product.hotScore && product.hotScore > 80" variant="destructive" class="text-xs">
                    热卖
                  </Badge>
                </div>
              </div>
              <CardContent class="p-4">
                <h3 class="font-medium text-zinc-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {{ product.name }}
                </h3>
                <div class="flex items-baseline gap-2 mt-2">
                  <span class="text-lg font-bold text-rose-500">¥{{ formatPrice(product.price) }}</span>
                  <span v-if="product.originalPrice" class="text-sm text-zinc-400 line-through">
                    ¥{{ formatPrice(product.originalPrice) }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs text-zinc-400">{{ product.hotScore || 0 }} 人已购买</span>
                  <Button
                    variant="outline"
                    size="sm"
                    @click.stop="addToCart(product.id)"
                  >
                    加入购物车
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- 列表视图 -->
          <div v-else class="space-y-4">
            <Card
              v-for="product in products"
              :key="product.id"
              class="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
              @click="goToDetail(product.id)"
            >
              <CardContent class="p-4 flex gap-4">
                <div class="w-32 h-32 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    :src="product.defaultImg || '/placeholder.png'"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-zinc-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {{ product.name }}
                  </h3>
                  <div class="flex items-baseline gap-2 mt-2">
                    <span class="text-lg font-bold text-rose-500">¥{{ formatPrice(product.price) }}</span>
                    <span v-if="product.originalPrice" class="text-sm text-zinc-400 line-through">
                      ¥{{ formatPrice(product.originalPrice) }}
                    </span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1">{{ product.hotScore || 0 }} 人已购买</p>
                  <Button
                    variant="outline"
                    size="sm"
                    class="mt-3"
                    @click.stop="addToCart(product.id)"
                  >
                    加入购物车
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              @click="handlePageChange(page - 1)"
              :disabled="page <= 1"
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <span class="text-sm text-zinc-500">
              第 {{ page }} / {{ totalPages }} 页
            </span>
            <Button
              variant="outline"
              size="icon"
              @click="handlePageChange(page + 1)"
              :disabled="page >= totalPages"
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
    </div>
  </div>
</template>
