<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import { useAdminStore } from '@/stores/admin';

const adminStore = useAdminStore();
const loading = ref(false);

const stats = ref([
  { title: '商品总数', value: '0', icon: ShoppingOutlined, color: '#3b82f6', bgColor: '#eff6ff' },
  { title: '订单总数', value: '0', icon: ShoppingCartOutlined, color: '#10b981', bgColor: '#ecfdf5' },
  { title: '用户总数', value: '0', icon: UserOutlined, color: '#f59e0b', bgColor: '#fffbeb' },
  { title: '今日访问', value: '0', icon: EyeOutlined, color: '#8b5cf6', bgColor: '#f5f3ff' },
]);

const recentOrders = ref([
  { id: 'ORD001', user: '张三', amount: '¥299.00', status: '已完成', time: '2024-03-09 10:30' },
  { id: 'ORD002', user: '李四', amount: '¥599.00', status: '待发货', time: '2024-03-09 09:45' },
  { id: 'ORD003', user: '王五', amount: '¥1,299.00', status: '已发货', time: '2024-03-09 08:20' },
  { id: 'ORD004', user: '赵六', amount: '¥89.00', status: '待付款', time: '2024-03-08 18:30' },
  { id: 'ORD005', user: '钱七', amount: '¥459.00', status: '已完成', time: '2024-03-08 16:15' },
]);

const orderColumns = [
  { title: '订单号', dataIndex: 'id', key: 'id' },
  { title: '用户', dataIndex: 'user', key: 'user' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '时间', dataIndex: 'time', key: 'time' },
];

onMounted(async () => {
  loading.value = true;
  // 模拟加载
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎横幅 -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
      <h1 class="text-2xl font-bold">欢迎回来，{{ adminStore.user?.nickName || adminStore.user?.adminName }}！</h1>
      <p class="mt-2 text-blue-100">这是您的商家后台控制台，您可以在这里管理商品、订单和用户。</p>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16">
      <a-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.title">
        <a-card class="h-full hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-500 text-sm">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-slate-800 mt-2">{{ stat.value }}</p>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: stat.bgColor }"
            >
              <component :is="stat.icon" :style="{ color: stat.color, fontSize: '24px' }" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作 -->
    <a-card title="快捷操作">
      <a-row :gutter="16">
        <a-col :xs="12" :sm="6" v-for="action in [
          { label: '添加商品', path: '/admin/product', color: 'blue' },
          { label: '管理分类', path: '/admin/category', color: 'green' },
          { label: '添加品牌', path: '/admin/brand', color: 'orange' },
          { label: '添加广告', path: '/admin/advertisement', color: 'purple' },
        ]" :key="action.label">
          <router-link :to="action.path">
            <a-button type="primary" block class="h-12">
              {{ action.label }}
            </a-button>
          </router-link>
        </a-col>
      </a-row>
    </a-card>

    <!-- 最近订单 -->
    <a-card title="最近订单">
      <a-table
        :columns="orderColumns"
        :data-source="recentOrders"
        :pagination="false"
        :loading="loading"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag
              :color="
                record.status === '已完成' ? 'green' :
                record.status === '待发货' ? 'orange' :
                record.status === '已发货' ? 'blue' : 'default'
              "
            >
              {{ record.status }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
