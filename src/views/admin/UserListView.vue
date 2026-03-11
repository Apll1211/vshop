<script setup lang="ts">
import {
	ClockCircleOutlined,
	InfoCircleOutlined,
	LockOutlined,
	ReloadOutlined,
	SearchOutlined,
	UnlockOutlined,
	UserOutlined,
	ClearOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { getFileUrl } from "@/api/request";
import type { UserInfo } from "@/api/types";
import { getAdminUserList, updateUserStatus } from "@/api/user";
import { formatDate } from "@/lib/utils";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const userData = ref<any[]>([]);
const searchKeyword = ref("");
const selectedRowKeys = ref<any[]>([]);

// 详情弹窗
const showDetailModal = ref(false);
const currentUser = ref<any>(null);

const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});

// 辅助函数：深度查找数组
const findList = (obj: any): any[] => {
	if (!obj) return [];
	if (Array.isArray(obj.userList)) return obj.userList;
	if (Array.isArray(obj.list)) return obj.list;
	if (Array.isArray(obj.data)) return obj.data;
	if (obj.data && Array.isArray(obj.data.userList)) return obj.data.userList;
	if (Array.isArray(obj)) return obj;
	return [];
};

// 格式化时长
const formatDuration = (login?: string, logout?: string) => {
	if (!login || !logout) return "-";
	const start = new Date(login).getTime();
	const end = new Date(logout).getTime();
	let diff = Math.abs(end - start);
	if (diff < 1000) return "不足1秒";
	const seconds = Math.floor((diff / 1000) % 60);
	const minutes = Math.floor((diff / (1000 * 60)) % 60);
	const hours = Math.floor(diff / (1000 * 60 * 60));
	let result = "";
	if (hours > 0) result += `${hours}小时`;
	if (minutes > 0) result += `${minutes}分`;
	if (result === "" || seconds > 0) result += `${seconds}秒`;
	return result;
};

const getUsername = (record: any) => {
	if (!record) return "未知用户";
	return record.nickName || record.username || record.phone || "未设置名称";
};

// 列表列定义
const columns = computed(() => [
	{ title: "用户ID", dataIndex: "id", key: "id", width: 100, ellipsis: true },
	{ title: "头像", dataIndex: "avatar", key: "avatar", width: 70, align: "center" },
	{ title: "会员昵称", dataIndex: "nickName", key: "nickName", minWidth: 120 },
	{ title: "登录手机号", dataIndex: "phone", key: "phone", minWidth: 140 },
	{ title: "注册时间", dataIndex: "regTime", key: "regTime", width: 170 },
	{ title: "最后登录", dataIndex: "loginTime", key: "loginTime", width: 170 },
	{ title: "上次在线时长", key: "duration", width: 120 },
	{ title: "状态", dataIndex: "status", key: "status", width: 80 },
	{ title: "操作", key: "action", width: 140 },
]);

const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
}));

// 获取用户列表
const fetchUsers = async () => {
	loading.value = true;
	try {
		const res = await getAdminUserList({
			keyword: searchKeyword.value,
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});

		const list = findList(res);
		userData.value = list.map((item: any) => ({
			...item,
			_id: item.id || item._id,
		}));

		const data = res as any;
		pagination.total = data.count || data.total || (data.data && (data.data.count || data.data.total)) || list.length;
		selectedRowKeys.value = [];
	} catch (error: any) {
		message.error("加载失败: " + (error.message || "网络异常"));
	} finally {
		loading.value = false;
	}
};

// 搜索
const handleSearch = () => {
	pagination.current = 1;
	fetchUsers();
};

// 重置
const handleReset = () => {
	searchKeyword.value = "";
	pagination.current = 1;
	fetchUsers();
};

const handleUpdateStatus = async (id: string, status: number, action: string) => {
	try {
		const res = await updateUserStatus(id, status);
		if (res && (res.code === 200 || res.ok === 1)) {
			message.success(`${action}成功`);
			fetchUsers();
		} else {
			message.error(res.message || `${action}失败`);
		}
	} catch (e: any) {
		message.error(e.message || "请求出错");
	}
};

const onToggleStatus = (record: any) => {
	const isFreeze = record.status === 1;
	const action = isFreeze ? "冻结" : "解封";
	Modal.confirm({
		title: `会员操作确认`,
		content: `确定要${action}用户 "${getUsername(record)}" 吗？`,
		onOk: () => handleUpdateStatus(record.id || record._id, isFreeze ? 0 : 1, action),
	});
};

const onBatchStatus = (status: number) => {
	if (selectedRowKeys.value.length === 0) return;
	const action = status === 1 ? "解封" : "冻结";
	Modal.confirm({
		title: `批量操作确认`,
		content: `确定要${action}选中的 ${selectedRowKeys.value.length} 个用户吗？`,
		onOk: async () => {
			const hide = message.loading(`处理中...`, 0);
			let successCount = 0;
			for (const id of selectedRowKeys.value) {
				try {
					const res = await updateUserStatus(id, status);
					if (res && (res.code === 200 || res.ok === 1)) successCount++;
				} catch (e) {}
			}
			hide();
			message.success(`成功执行 ${successCount} 项操作`);
			fetchUsers();
		},
	});
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchUsers();
};

onMounted(() => {
	fetchUsers();
});
</script>

<template>
  <div class="user-management-container">
    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">用户管理</h1>
        <a-tag color="processing">商城会员</a-tag>
      </div>
      <div class="action-group">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索昵称/手机号"
          class="search-input"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined class="text-slate-400" /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">
          <template #icon><ClearOutlined /></template>
          重置
        </a-button>
        <a-button @click="fetchUsers" :loading="loading">
          <template #icon><ReloadOutlined /></template>
        </a-button>
      </div>
    </div>

    <!-- 批量工具栏 -->
    <div v-if="selectedRowKeys.length > 0" class="batch-toolbar">
      <span class="selection-info">已选中 {{ selectedRowKeys.length }} 名会员</span>
      <a-space>
        <a-button size="small" @click="selectedRowKeys = []">取消</a-button>
        <a-button size="small" type="primary" @click="onBatchStatus(1)">批量解封</a-button>
        <a-button size="small" type="primary" danger @click="onBatchStatus(0)">批量冻结</a-button>
      </a-space>
    </div>

    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="userData"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 名注册会员`,
          size: isMobile ? 'small' : 'default',
        }"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="getFileUrl(record.avatar)" :size="32">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>

          <template v-if="column.key === 'phone'">
            <div class="flex items-center gap-2 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
              </svg>
              <span class="font-mono text-xs">{{ record.phone || '-' }}</span>
            </div>
          </template>

          <template v-if="column.key === 'regTime' || column.key === 'loginTime'">
            <span class="text-slate-500 text-xs">{{ formatDate(record[column.key as string]) }}</span>
          </template>

          <template v-if="column.key === 'duration'">
            <a-tooltip :title="`登出时间: ${formatDate(record.outLoginTime)}`">
              <div class="flex items-center gap-1 text-indigo-500 font-medium text-xs">
                <ClockCircleOutlined class="text-[10px]" />
                {{ formatDuration(record.loginTime, record.outLoginTime) }}
              </div>
            </a-tooltip>
          </template>

          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 1 ? 'success' : 'error'" :text="record.status === 1 ? '正常' : '封禁'" />
          </template>

          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="link" size="small" @click="() => { currentUser = record; showDetailModal = true; }">
                查看
              </a-button>
              <a-button type="link" size="small" :danger="record.status === 1" @click="onToggleStatus(record)">
                {{ record.status === 1 ? '冻结' : '解除' }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情 Modal -->
    <a-modal v-model:open="showDetailModal" title="会员账号详情" :footer="null">
      <div v-if="currentUser" class="detail-content">
        <div class="detail-header">
          <a-avatar :size="64" :src="getFileUrl(currentUser.avatar)">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <h3 class="m-0 mt-3">{{ getUsername(currentUser) }}</h3>
        </div>
        <a-descriptions bordered :column="1" size="small" class="mt-6">
          <a-descriptions-item label="会员ID"><span class="code-text">{{ currentUser.id }}</span></a-descriptions-item>
          <a-descriptions-item label="手机号码">{{ currentUser.phone || 'N/A' }}</a-descriptions-item>
          <a-descriptions-item label="展示昵称">{{ currentUser.nickName || 'N/A' }}</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ formatDate(currentUser.regTime) }}</a-descriptions-item>
          <a-descriptions-item label="最后登录">{{ formatDate(currentUser.loginTime) }}</a-descriptions-item>
          <a-descriptions-item label="上次登录时长">
            <span class="text-indigo-600 font-bold">{{ formatDuration(currentUser.loginTime, currentUser.outLoginTime) }}</span>
            <span class="text-slate-400 text-[10px] ml-2">(登出于 {{ formatDate(currentUser.outLoginTime) }})</span>
          </a-descriptions-item>
          <a-descriptions-item label="登录状态">
            <a-tag :color="currentUser.status === 1 ? 'green' : 'red'">{{ currentUser.status === 1 ? '准许登录' : '禁止访问' }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.user-management-container { padding: 4px; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.title-group { display: flex; align-items: center; gap: 8px; }
.page-title { font-size: 20px; font-weight: 600; margin: 0; color: #1e293b; }
.action-group { display: flex; gap: 8px; align-items: center; }
.search-input { width: 220px; }
.table-card { border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; }
.batch-toolbar { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
.selection-info { color: #6366f1; font-size: 13px; font-weight: 500; }
.detail-header { text-align: center; margin-bottom: 20px; }
.code-text { font-family: monospace; font-size: 12px; color: #64748b; }
</style>
