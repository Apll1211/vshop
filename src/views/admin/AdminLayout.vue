<script setup lang="ts">
import {
	AppstoreOutlined,
	DashboardOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	FileTextOutlined,
	HistoryOutlined,
	HomeOutlined,
	LogoutOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PictureOutlined,
	ShopOutlined,
	ShoppingOutlined,
	TrademarkOutlined,
	UserOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Layout, Menu, Modal, message } from "ant-design-vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getFileUrl } from "@/api/request";
import { useAdminStore } from "@/stores/admin";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = computed(() => breakpoints.smaller("md").value);
const collapsed = ref(false);

watch(
	isMobile,
	(val) => {
		if (val) collapsed.value = true;
	},
	{ immediate: true },
);

const selectedKeys = ref<string[]>([route.name as string]);

watch(
	() => route.name,
	(name) => {
		selectedKeys.value = [name as string];
	},
);

const handleMenuClick = ({ key }: { key: string }) => {
	router.push({ name: key });
	if (isMobile.value) collapsed.value = true;
};

const goHome = () => {
	router.push("/");
};

const handleLogout = () => {
	Modal.confirm({
		title: "确认退出",
		content: "确定要退出登录吗？",
		onOk: async () => {
			await adminStore.logout();
			router.push("/admin/login");
			message.success("已退出登录");
		},
	});
};

onMounted(() => {
	if (!adminStore.isLoggedIn) {
		router.push("/admin/login");
	}
});
</script>

<template>
  <a-layout class="admin-main-layout">
    <!-- 侧边栏：采用 Flex 布局以固定底部 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :collapsed-width="isMobile ? 0 : 80"
      :width="220"
      theme="dark"
      class="admin-side-bar"
    >
      <div class="sider-flex-container">
        <!-- 1. Logo 区域 -->
        <div class="logo-container">
          <img src="@/assets/logo-m.svg" class="logo-img" />
          <span v-if="!collapsed" class="logo-text">南渡后台</span>
        </div>
        
        <!-- 2. 菜单区域：自适应填充剩余空间 -->
        <div class="menu-container">
          <a-menu
            v-model:selectedKeys="selectedKeys"
            theme="dark"
            mode="inline"
            @click="handleMenuClick"
          >
            <a-menu-item key="admin-dashboard">
              <template #icon><DashboardOutlined /></template>
              <span>工作台</span>
            </a-menu-item>
            
            <a-menu-item key="admin-category">
              <template #icon><AppstoreOutlined /></template>
              <span>分类管理</span>
            </a-menu-item>
            
            <a-menu-item key="admin-brand">
              <template #icon><TrademarkOutlined /></template>
              <span>品牌管理</span>
            </a-menu-item>
            
            <a-menu-item key="admin-product">
              <template #icon><ShoppingOutlined /></template>
              <span>商品管理</span>
            </a-menu-item>

            <a-menu-item key="admin-shop">
              <template #icon><ShopOutlined /></template>
              <span>店铺管理</span>
            </a-menu-item>
            
            <a-menu-item key="admin-advertisement">
              <template #icon><PictureOutlined /></template>
              <span>广告管理</span>
            </a-menu-item>

            <a-menu-item key="admin-log">
              <template #icon><HistoryOutlined /></template>
              <span>操作日志</span>
            </a-menu-item>
            
            <a-menu-item key="admin-user">
              <template #icon><UserOutlined /></template>
              <span>管理员管理</span>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- 3. 底部操作区域 -->
        <div class="sider-footer">
          <div class="footer-action-item" @click="goHome" :title="collapsed ? '返回前台' : ''">
            <HomeOutlined class="action-icon" />
            <span v-if="!collapsed" class="action-text">返回商城</span>
          </div>
        </div>
      </div>
    </a-layout-sider>

    <a-layout class="admin-content-layout">
      <!-- 顶部 Header -->
      <a-layout-header class="admin-header">
        <div class="header-left">
          <div class="collapse-trigger" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </div>
          <h2 class="page-title">
            {{ route.meta.title?.split(' - ')[0] || '系统管理' }}
          </h2>
        </div>

        <div class="header-right">
          <a-tooltip :title="adminStore.stealthMode ? '隐身模式已开启' : '隐身模式已关闭'">
            <div 
              class="stealth-mode-btn"
              :class="{ 'active': adminStore.stealthMode }"
              @click="adminStore.toggleStealthMode"
            >
              <EyeInvisibleOutlined v-if="adminStore.stealthMode" />
              <EyeOutlined v-else />
            </div>
          </a-tooltip>

          <a-dropdown>
            <div class="admin-user-info">
              <a-avatar :size="28" :src="getFileUrl(adminStore.user?.avatar)">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="user-name">{{ adminStore.user?.nickName || adminStore.user?.adminName }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout" danger>
                  <template #icon><LogoutOutlined /></template>
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 主要内容区域 -->
      <a-layout-content class="admin-page-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.admin-main-layout {
  min-height: 100vh;
}

.admin-side-bar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  background: #001529;
}

/* 侧边栏 Flex 容器 */
.sider-flex-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.logo-container {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
  white-space: nowrap;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 隐藏滚动条但保留功能 */
.menu-container::-webkit-scrollbar {
  width: 0px;
}

/* 侧边栏底部 */
.sider-footer {
  padding: 12px 0;
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.footer-action-item {
  height: 40px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s;
}

.footer-action-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 14px;
  white-space: nowrap;
}

/* 折叠状态样式 */
:deep(.ant-layout-sider-collapsed) .footer-action-item {
  padding: 0;
  justify-content: center;
}

.admin-content-layout {
  background: #f0f2f5;
}

.admin-header {
  background: white;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 90;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-trigger {
  font-size: 18px;
  cursor: pointer;
  padding: 0 12px;
  margin-right: 16px;
  transition: color 0.3s;
}

.collapse-trigger:hover {
  color: #1890ff;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stealth-mode-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.3s;
}

.stealth-mode-btn:hover {
  background: #f5f5f5;
}

.stealth-mode-btn.active {
  background: #f9f0ff;
  color: #722ed1;
  box-shadow: 0 0 8px rgba(114, 46, 209, 0.15);
}

.admin-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.admin-user-info:hover {
  background: #f5f5f5;
}

.user-name {
  color: #666;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-page-content {
  padding: 24px;
  min-height: 280px;
}

.content-wrapper {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-height: 100%;
}

@media (max-width: 768px) {
  .admin-page-content {
    padding: 12px;
  }
  .content-wrapper {
    padding: 16px;
  }
  .user-name {
    display: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
