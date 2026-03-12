<script setup lang="ts">
import {
	PictureOutlined,
	ShopOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { getAdminOrderList, getAdvList, getDashboardStats, getShopList, getSpuList } from "@/api";
import { getFileUrl } from "@/api/request";
import { useAdminStore } from "@/stores";

const adminStore = useAdminStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = ref(breakpoints.smaller("md"));
const loading = ref(false);

const stats = ref([
	{
		title: "商品总数",
		value: "0",
		icon: ShoppingOutlined,
		color: "#3b82f6",
		bgColor: "#eff6ff",
	},
	{
		title: "订单总数",
		value: "0",
		icon: ShoppingCartOutlined,
		color: "#10b981",
		bgColor: "#ecfdf5",
	},
	{
		title: "店铺总数",
		value: "0",
		icon: ShopOutlined,
		color: "#f59e0b",
		bgColor: "#fffbeb",
	},
	{
		title: "广告总数",
		value: "0",
		icon: PictureOutlined,
		color: "#8b5cf6",
		bgColor: "#f5f3ff",
	},
]);

// 获取统计数据
const fetchData = async () => {
	loading.value = true;
	try {
		const [spuRes, orderRes, shopRes, advRes] = await Promise.all([
			getSpuList({ pageSize: 1 }).catch(() => null),
			getAdminOrderList({ pageSize: 1 }).catch(() => null),
			getShopList().catch(() => null),
			getAdvList({ pageSize: 1 }).catch(() => null),
		]);

		if (spuRes && stats.value[0]) {
			const d = spuRes as any;
			stats.value[0].value = String(d.count || d.total || d.data?.count || d.data?.total || 0);
		}
		if (orderRes && stats.value[1]) {
			const d = orderRes as any;
			stats.value[1].value = String(d.count || d.total || d.data?.count || d.data?.total || 0);
		}
		if (shopRes && stats.value[2]) {
			const d = shopRes as any;
			const list = d.shopList || d.data?.shopList || (Array.isArray(d) ? d : []);
			stats.value[2].value = String(list.length || 0);
		}
		if (advRes && stats.value[3]) {
			const d = advRes as any;
			stats.value[3].value = String(d.total || d.count || d.data?.total || d.data?.count || 0);
		}

		try {
			const statsRes: any = await getDashboardStats();
			if (statsRes) {
				// 拦截器已处理，直接访问属性
				const s = statsRes.data || statsRes;
				if (s.productCount !== undefined && stats.value[0]) stats.value[0].value = String(s.productCount);
				if (s.orderCount !== undefined && stats.value[1]) stats.value[1].value = String(s.orderCount);
				if (s.shopCount !== undefined && stats.value[2]) stats.value[2].value = String(s.shopCount);
				if (s.advCount !== undefined && stats.value[3]) stats.value[3].value = String(s.advCount);
			}
		} catch (e) {
			// ignore
		}
	} catch (error) {
		// 捕获异常
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	// 1. 强制重新拉取管理员信息，确保拿到了最新的 avatar
	await adminStore.fetchAdminInfo();

	// 2. 加载统计数据
	await fetchData();
});
</script>

<template>
  <div class="space-y-4 md:space-y-6 pb-10">
    <!-- 欢迎横幅 -->
    <div class="bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl p-5 md:p-8 text-white shadow-md flex items-center justify-between overflow-hidden relative">
      <div class="z-10 flex-1">
        <h1 class="text-xl md:text-3xl font-bold">欢迎回来，{{ adminStore.user?.nickName || adminStore.user?.adminName }}！</h1>
        <p class="mt-2 text-blue-100 text-sm md:text-base opacity-90 max-w-2xl">
          这是您的后台控制台，您可以在这里高效管理各项业务。
        </p>
      </div>
      
      <!-- 头像区域 (高度加固版) -->
      <div class="shrink-0 z-10 ml-4 hidden sm:block">
        <div class="p-1 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 shadow-lg">
          <div 
            class="rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-blue-400"
            :style="{ width: isMobile ? '64px' : '88px', height: isMobile ? '64px' : '88px' }"
          >
            <!-- 方案：直接使用 getFileUrl，并通过 key 强制刷新 -->
            <img
              v-if="adminStore.user?.avatar"
              :key="adminStore.user.avatar"
              :src="getFileUrl(adminStore.user.avatar, adminStore.user?._id || adminStore.user?.id)"
              class="w-full h-full object-cover"
              alt="Avatar"
            />            <span v-else class="text-2xl font-bold uppercase">
              {{ (adminStore.user?.nickName || adminStore.user?.adminName || 'A').substring(0, 1) }}
            </span>
          </div>
        </div>
      </div>

      <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute right-20 -top-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl"></div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="[12, 12]">
      <a-col :xs="12" :sm="12" :lg="6" v-for="stat in stats" :key="stat.title">
        <a-card class="h-full hover:shadow-lg transition-shadow border-none shadow-sm" :loading="loading" :body-style="{ padding: isMobile ? '12px' : '20px' }">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p class="text-slate-500 text-xs sm:text-sm font-medium">{{ stat.title }}</p>
              <p class="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{{ stat.value }}</p>
            </div>
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: stat.bgColor }"
            >
              <component :is="stat.icon" :style="{ color: stat.color, fontSize: isMobile ? '20px' : '24px' }" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作 -->
    <a-card title="快捷操作" :body-style="{ padding: isMobile ? '12px' : '24px' }" class="border-none shadow-sm">
      <a-row :gutter="[12, 12]">
        <a-col :xs="12" :sm="6" v-for="action in [
          { label: '添加商品', path: '/admin/product', color: 'blue' },
          { label: '分类管理', path: '/admin/category', color: 'green' },
          { label: '品牌管理', path: '/admin/brand', color: 'orange' },
          { label: '广告管理', path: '/admin/advertisement', color: 'purple' },
        ]" :key="action.label">
          <router-link :to="action.path">
            <a-button type="primary" block class="h-10 md:h-12 text-sm font-medium hover:scale-105 transition-transform">
              {{ action.label }}
            </a-button>
          </router-link>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>
