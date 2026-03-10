<script setup lang="ts">
import {
	ChevronDown,
	LogOut,
	Package,
	Search,
	Settings,
	ShoppingCart,
	User,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LogoAnimated from "@/components/LogoAnimated.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCartStore, useCategoryStore, useUserStore } from "@/stores";
import TheCategoryNav from "./TheCategoryNav.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const cartStore = useCartStore();
const categoryStore = useCategoryStore();

const searchKeyword = ref("");

const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);
const cartCount = computed(() => cartStore.cartCount);

function handleSearch() {
	if (searchKeyword.value.trim()) {
		router.push({
			name: "search",
			query: { keyword: searchKeyword.value.trim() },
		});
	}
}

function handleLogout() {
	userStore.logoutAction();
	router.push("/");
}

function goToCart() {
	router.push("/cart");
}

function goToOrders() {
	router.push("/orders");
}

function goToLogin() {
	router.push("/login");
}

onMounted(() => {
	categoryStore.getCategoryList();
	if (isLoggedIn.value) {
		cartStore.getCartListAction();
	}
});
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/80 shadow-sm">
    <!-- 主导航栏 -->
    <div class="container mx-auto px-4 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 shrink-0">
          <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden shadow-lg">
            <LogoAnimated />
          </div>
          <span class="text-xl lg:text-2xl font-bold text-slate-900 hidden sm:block">南渡商城</span>
        </router-link>

        <!-- 搜索栏 -->
        <div class="flex-1 max-w-xl lg:max-w-2xl mx-2 lg:mx-6">
          <form @submit.prevent="handleSearch" class="flex">
            <Input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索商品..."
              class="rounded-r-none border-r-0 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-10 lg:h-12 text-sm lg:text-base"
            />
            <Button type="submit" class="rounded-l-none px-4 lg:px-8 bg-blue-600 hover:bg-blue-700 h-10 lg:h-12">
              <Search class="w-4 h-4 lg:mr-2" />
              <span class="hidden lg:inline">搜索</span>
            </Button>
          </form>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-1 lg:gap-2">
          <!-- 购物车 -->
          <Button variant="ghost" class="relative h-10 lg:h-12 px-2 lg:px-4 hover:bg-blue-50 hover:text-blue-600" @click="goToCart">
            <ShoppingCart class="w-5 h-5 lg:w-6 lg:h-6" />
            <span class="hidden lg:inline ml-2">购物车</span>
            <Badge
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 lg:top-0 lg:right-0 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-orange-500"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </Badge>
          </Button>

          <!-- 用户菜单 -->
          <DropdownMenu v-if="isLoggedIn">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="h-10 lg:h-12 px-2 lg:px-4 hover:bg-blue-50 hover:text-blue-600">
                <User class="w-5 h-5 lg:w-6 lg:h-6 lg:mr-2" />
                <span class="hidden lg:inline">{{ userInfo?.username || '用户' }}</span>
                <ChevronDown class="w-4 h-4 ml-1 hidden lg:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click="goToOrders" class="hover:bg-blue-50 focus:bg-blue-50">
                <Package class="w-4 h-4 mr-2 text-blue-500" />
                我的订单
              </DropdownMenuItem>
              <DropdownMenuItem class="hover:bg-blue-50 focus:bg-blue-50">
                <Settings class="w-4 h-4 mr-2 text-slate-500" />
                个人设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout" class="text-red-500 hover:bg-red-50 focus:bg-red-50">
                <LogOut class="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            v-else 
            variant="ghost" 
            size="icon"
            @click="goToLogin" 
            class="h-10 w-10 lg:h-12 lg:w-12 rounded-full hover:bg-blue-50 hover:text-blue-600"
            title="登录"
          >
            <User class="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <TheCategoryNav />
  </header>
</template>