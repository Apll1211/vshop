<script setup lang="ts">
import { ChevronDown, ChevronRight, ChevronsRight, ChevronLeft } from "lucide-vue-next";
import { computed, ref, onUnmounted, onMounted } from "vue";
import { useRouter } from "vue-router";
import { motion, AnimatePresence } from "motion-v";
import type { Category, Trademark } from "@/api/types";
import { useCategoryStore } from "@/stores";
import { getTrademarkListPage } from "@/api/product";

const router = useRouter();
const categoryStore = useCategoryStore();

const categoryList = computed(() => categoryStore.categoryList);
const hoverCategoryId = ref<string | null>(null);
const hoverItemId = ref<string | null>(null);

// 品牌列表 - 懒加载分页
const allTrademarks = ref<Trademark[]>([]);
const trademarkPage = ref(1);
const trademarkPageSize = 6;
const backendPage = ref(1); // 后端已获取到的页数
const backendTotal = ref(0); // 后端总数据量
const isLoading = ref(false);

// 当前页显示的品牌
const quickNavs = computed(() => {
  const start = (trademarkPage.value - 1) * trademarkPageSize;
  const end = start + trademarkPageSize;
  return allTrademarks.value.slice(start, end).map(tm => ({
    id: tm.id,
    name: tm.name,
  }));
});

// 总页数基于后端总数
const trademarkTotalPages = computed(() => Math.ceil(backendTotal.value / trademarkPageSize));
const canPrev = computed(() => trademarkPage.value > 1);
const canNext = computed(() => trademarkPage.value < trademarkTotalPages.value);

// 防抖相关
let openDropdownTimer: ReturnType<typeof setTimeout> | null = null;
let openSubMenuTimer: ReturnType<typeof setTimeout> | null = null;
const OPEN_DELAY = 150; // 主菜单展开延迟(ms)
const SUB_MENU_DELAY = 100; // 二级菜单展开延迟(ms)

// 获取品牌列表（按需加载）
async function fetchTrademarkPage(page: number) {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const res = await getTrademarkListPage({ page, limit: trademarkPageSize }) as any;
    if (res) {
      const list = res.data || res.trademarkList || [];
      backendTotal.value = res.total || list.length;
      // 追加到本地缓存
      allTrademarks.value = [...allTrademarks.value, ...list];
      backendPage.value = page;
    }
  } catch (error) {
    console.error('获取品牌列表失败:', error);
  } finally {
    isLoading.value = false;
  }
}

// 初始化加载第一页
async function initTrademarks() {
  await fetchTrademarkPage(1);
}

// 切换品牌页（懒加载）
async function prevTrademarkPage() {
  if (canPrev.value) {
    trademarkPage.value--;
  }
}

async function nextTrademarkPage() {
  if (!canNext.value) return;
  
  const nextPage = trademarkPage.value + 1;
  const requiredDataIndex = nextPage * trademarkPageSize;
  
  // 如果本地数据不足，先从后端获取下一页
  if (allTrademarks.value.length < requiredDataIndex && backendPage.value < trademarkTotalPages.value) {
    await fetchTrademarkPage(backendPage.value + 1);
  }
  
  trademarkPage.value = nextPage;
}

// 组件挂载时获取品牌列表（分类数据已在Header中获取）
onMounted(() => {
  initTrademarks();
});

// 打开主下拉菜单(带防抖)
function handleMainEnter() {
  if (openDropdownTimer) {
    clearTimeout(openDropdownTimer);
  }
  openDropdownTimer = setTimeout(() => {
    hoverCategoryId.value = 'all';
  }, OPEN_DELAY);
}

// 关闭主下拉菜单
function handleMainLeave() {
  if (openDropdownTimer) {
    clearTimeout(openDropdownTimer);
    openDropdownTimer = null;
  }
  hoverCategoryId.value = null;
}

// 打开二级菜单(带防抖)
function handleItemEnter(catId: string) {
  if (openSubMenuTimer) {
    clearTimeout(openSubMenuTimer);
  }
  openSubMenuTimer = setTimeout(() => {
    hoverItemId.value = catId;
  }, SUB_MENU_DELAY);
}

// 关闭二级菜单
function handleItemLeave() {
  if (openSubMenuTimer) {
    clearTimeout(openSubMenuTimer);
    openSubMenuTimer = null;
  }
  hoverItemId.value = null;
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (openDropdownTimer) {
    clearTimeout(openDropdownTimer);
  }
  if (openSubMenuTimer) {
    clearTimeout(openSubMenuTimer);
  }
});

// 动画配置
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: {
      duration: 0.15
    }
  }
}

const subMenuVariants = {
  hidden: {
    opacity: 0,
    x: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    x: -5,
    transition: {
      duration: 0.1
    }
  }
}

// 跳转分类搜索
function goToCategory(category: Category, _level: number) {
	router.push({ path: '/search', query: { keyword: category.name } })
}
</script>

<template>
  <div class="border-t border-slate-200/50 hidden md:block">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="h-10 flex">
        <!-- 全部分类 -->
        <div
          class="relative group h-full"
          @mouseenter="handleMainEnter"
          @mouseleave="handleMainLeave"
        >
          <div
            class="flex items-center justify-center gap-1 px-4 h-full bg-blue-600 text-white text-sm font-medium cursor-pointer leading-none"
          >
            <span class="leading-none">全部商品分类</span>
            <ChevronDown class="w-4 h-4 transition-transform leading-none" :class="{ 'rotate-180': hoverCategoryId === 'all' }" />
          </div>
          
          <!-- 分类下拉菜单 -->
          <AnimatePresence>
            <motion.div
              v-if="hoverCategoryId === 'all'"
              :variants="dropdownVariants"
              initial="hidden"
              animate="visible"
              exit="exit"
              class="absolute left-0 top-full w-64 bg-white border-x border-b border-slate-200 shadow-xl z-50 rounded-b-lg"
            >
              <div>
                <div
                  v-for="cat1 in categoryList"
                  :key="cat1.id"
                  class="relative"
                  @mouseenter="handleItemEnter(cat1.id)"
                  @mouseleave="handleItemLeave"
                >
                  <div
                    class="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    @click="goToCategory(cat1, 1)"
                  >
                    <span class="text-slate-700 hover:text-blue-600">{{ cat1.name }}</span>
                    <div class="relative w-4 h-4">
                      <ChevronRight class="w-4 h-4 text-slate-400 absolute transition-all duration-200" :class="{ 'opacity-0 scale-75': hoverItemId === cat1.id }" />
                      <ChevronsRight class="w-4 h-4 text-blue-500 absolute transition-all duration-200" :class="{ 'opacity-0 scale-75': hoverItemId !== cat1.id }" />
                    </div>
                  </div>
                  
                  <!-- 二级分类 -->
                  <AnimatePresence>
                    <motion.div
                      v-if="cat1.children && cat1.children.length > 0 && hoverItemId === cat1.id"
                      :variants="subMenuVariants"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      class="absolute left-full top-0 w-80 bg-white border border-slate-200 shadow-xl rounded-r-lg"
                    >
                      <div class="p-4">
                        <div
                          v-for="cat2 in cat1.children"
                          :key="cat2.id"
                          class="mb-3 last:mb-0"
                        >
                          <div
                            class="text-sm font-medium text-slate-900 hover:text-blue-600 cursor-pointer mb-1.5"
                            @click.stop="goToCategory(cat2, 2)"
                          >
                            {{ cat2.name }}
                          </div>
                          <div class="flex flex-wrap gap-2">
                            <span
                              v-for="cat3 in cat2.children"
                              :key="cat3.id"
                              class="text-xs text-slate-500 hover:text-blue-600 cursor-pointer bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                              @click.stop="goToCategory(cat3, 3)"
                            >
                              {{ cat3.name }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <!-- 快捷导航 -->
        <nav class="flex items-center ml-2">
          <!-- 上一页按钮 -->
          <button
            @click="prevTrademarkPage"
            :disabled="!canPrev"
            class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
            title="上一页"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          <!-- 品牌列表 -->
          <div class="flex items-center gap-1">
            <router-link
              v-for="nav in quickNavs"
              :key="nav.id"
              :to="{ path: '/search', query: { keyword: nav.name } }"
              class="px-4 h-8 flex items-center text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              {{ nav.name }}
            </router-link>
          </div>
          
          <!-- 下一页按钮 -->
          <button
            @click="nextTrademarkPage"
            :disabled="!canNext"
            class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
            title="下一页"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
