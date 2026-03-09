<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();

const collapsed = ref(false);
const selectedKeys = ref<string[]>(['dashboard']);

const menuItems = computed(() => {
  const items = [
    {
      key: 'dashboard',
      icon: DashboardOutlined,
      label: '控制台',
      path: '/admin',
    },
    {
      key: 'category',
      icon: AppstoreOutlined,
      label: '分类管理',
      path: '/admin/category',
    },
    {
      key: 'brand',
      icon: TagsOutlined,
      label: '品牌管理',
      path: '/admin/brand',
    },
    {
      key: 'product',
      icon: ShoppingOutlined,
      label: '商品管理',
      path: '/admin/product',
    },
    {
      key: 'advertisement',
      icon: PictureOutlined,
      label: '广告管理',
      path: '/admin/advertisement',
    },
    {
      key: 'shop',
      icon: ShopOutlined,
      label: '店铺管理',
      path: '/admin/shop',
    },
  ];

  // 仅管理员可见的菜单
  if (adminStore.isAdmin) {
    items.push({
      key: 'admin-user',
      icon: TeamOutlined,
      label: '管理员管理',
      path: '/admin/admin-user',
    });
    items.push({
      key: 'log',
      icon: FileTextOutlined,
      label: '操作日志',
      path: '/admin/log',
    });
  }

  return items;
});

const handleMenuClick = ({ key }: { key: string }) => {
  const item = menuItems.value.find((i) => i.key === key);
  if (item) {
    router.push(item.path);
  }
};

const handleLogout = async () => {
  await adminStore.logout();
  message.success('已退出登录');
  router.push('/admin/login');
};

const handleBackToStore = () => {
  window.location.href = '/';
};

onMounted(async () => {
  // 根据路由设置选中的菜单
  const path = route.path;
  if (path === '/admin') {
    selectedKeys.value = ['dashboard'];
  } else {
    const key = path.split('/')[2];
    if (key) {
      selectedKeys.value = [key];
    }
  }

  // 获取管理员信息
  if (!adminStore.user) {
    await adminStore.fetchAdminInfo();
  }
});
</script>

<template>
  <a-layout class="min-h-screen">
    <!-- Sider -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      class="bg-slate-900 h-screen"
      width="240"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-slate-700">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">Z</span>
          </div>
          <span v-if="!collapsed" class="text-white font-semibold text-lg">南渡商城</span>
        </div>
      </div>

      <!-- Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        class="bg-slate-900 border-r-0"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Main Content -->
    <a-layout class="bg-slate-100">
      <!-- Header -->
      <a-layout-header class="bg-white px-6 flex items-center justify-between shadow-sm h-16">
        <div class="flex items-center gap-4">
          <a-button
            type="text"
            @click="collapsed = !collapsed"
            class="text-slate-600 hover:text-slate-900"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
        </div>

        <div class="flex items-center gap-4">
          <a-button type="link" @click="handleBackToStore" class="text-slate-600">
            返回商城
          </a-button>

          <a-dropdown>
            <div class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg">
              <a-avatar :size="32" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="text-slate-700">{{ adminStore.user?.nickName || adminStore.user?.adminName }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  <span class="ml-2">个人信息</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout" class="text-red-500">
                  <LogoutOutlined />
                  <span class="ml-2">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="p-6 flex-1">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.ant-layout-sider-dark) {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
}

:deep(.ant-menu-dark) {
  background: transparent !important;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%) !important;
}
</style>
