<script setup lang="ts">
import {
	PictureOutlined,
	ShopOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
} from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import {
	getAdminOrderList,
	getAdvList,
	getDashboardStats,
	getShopList,
	getSpuList,
} from "@/api";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = ref(breakpoints.smaller('md'));
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
		// 尝试获取统计数据
		const statsRes = await getDashboardStats().catch(() => null);

		// 手动从各接口获取数据以保证实时性
		const [spuRes, orderRes, shopRes, advRes] = await Promise.all([
			getSpuList({ pageSize: 1 }).catch(() => null),
			getAdminOrderList({ pageSize: 1 }).catch(() => null),
			getShopList().catch(() => null),
			getAdvList({ pageSize: 1 }).catch(() => null),
		]);

		// 更新统计卡片
		if (spuRes?.code === 200) stats.value[0].value = String(spuRes.count || 0);
		if (orderRes?.code === 200)
			stats.value[1].value = String(orderRes.count || 0);
		if (shopRes?.code === 200)
			stats.value[2].value = String(shopRes.shopList?.length || 0);
		if (advRes?.code === 200) stats.value[3].value = String(advRes.total || 0);

		// 如果接口返回了专用的统计数据且不为0，则尝试更新
		if (statsRes?.code === 200) {
			if (statsRes.productCount)
				stats.value[0].value = String(statsRes.productCount);
			if (statsRes.orderCount)
				stats.value[1].value = String(statsRes.orderCount);
			if (statsRes.shopCount) stats.value[2].value = String(statsRes.shopCount);
			if (statsRes.advCount) stats.value[3].value = String(statsRes.advCount);
		}
	} catch (error) {
		console.error("获取仪表盘数据失败:", error);
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	await fetchData();
});
</script>

<template>
  <div class="space-y-4 md:space-y-6 pb-10">
    <!-- 欢迎横幅 -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 md:p-6 text-white shadow-md">
      <h1 class="text-xl md:text-2xl font-bold">欢迎回来，{{ adminStore.user?.nickName || adminStore.user?.adminName }}！</h1>
      <p class="mt-2 text-blue-100 text-sm md:text-base opacity-90">这是您的商家后台控制台，您可以在这里高效管理各项业务。</p>
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
