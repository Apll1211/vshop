<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	UserOutlined,
	ClearOutlined,
	SearchOutlined,
	ReloadOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import { deleteAdmin, getAdminList, saveAdmin } from "@/api";
import { getFileUrl } from "@/api/request";
import type { AdminUser } from "@/api/types";
import FileUpload from "@/components/FileUpload.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const adminData = ref<AdminUser[]>([]);
const searchKeyword = ref("");
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const showModal = ref(false);
const editingAdmin = ref<AdminUser | null>(null);
const formState = reactive({
	id: "",
	adminName: "",
	password: "",
	nickName: "",
	avatar: "",
	role: "merchant" as "admin" | "merchant",
});

const selectedRowKeys = ref<string[]>([]);

// 选择框配置
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
	getCheckboxProps: (record: AdminUser) => ({
		disabled: record.adminName === "admin" || record.adminName === "yuma",
		name: record.adminName,
	}),
}));

const columns = computed(() => [
	{ title: "头像", dataIndex: "avatar", key: "avatar", width: 80, align: "center" },
	{ title: "用户名", dataIndex: "adminName", key: "adminName", minWidth: 120 },
	{ title: "昵称", dataIndex: "nickName", key: "nickName", minWidth: 120 },
	{ title: "角色", dataIndex: "role", key: "role", width: 120 },
	{ title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
	{ title: "操作", key: "action", width: 160 },
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		return columns.value.filter(
			(col) => !["avatar", "role", "createTime"].includes(col.key as string),
		);
	}
	return columns.value;
});

// 获取管理员列表
const fetchAdmins = async () => {
	loading.value = true;
	try {
		const res = await getAdminList();
		const data = res as any;
		let list = data.adminList || (data.data && data.data.adminList) || [];

		// 前端模拟搜索 (因为后端该接口可能不支持搜索参数)
		if (searchKeyword.value) {
			const kw = searchKeyword.value.toLowerCase();
			list = list.filter((a: any) => 
				(a.adminName && a.adminName.toLowerCase().includes(kw)) || 
				(a.nickName && a.nickName.toLowerCase().includes(kw))
			);
		}

		const mappedList = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));

		pagination.total = mappedList.length;
		const start = (pagination.current - 1) * pagination.pageSize;
		const end = start + pagination.pageSize;
		adminData.value = mappedList.slice(start, end);
		selectedRowKeys.value = [];
	} catch (error) {
		message.error("获取管理员列表失败");
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pagination.current = 1;
	fetchAdmins();
};

const handleReset = () => {
	searchKeyword.value = "";
	pagination.current = 1;
	fetchAdmins();
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchAdmins();
};

const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在执行批量删除...`, 0);
	let successCount = 0;
	for (const id of ids) {
		try {
			await deleteAdmin(id);
			successCount++;
		} catch (e) {}
	}
	hide();
	message.success(`成功删除 ${successCount} 个账号`);
	fetchAdmins();
};

const handleSubmit = async () => {
	if (!editingAdmin.value) {
		if (!formState.adminName) return message.warning("请输入用户名");
		if (!formState.password) return message.warning("请输入密码");
	}
	loading.value = true;
	try {
		const submitData: any = { ...formState };
		if (editingAdmin.value) {
			submitData.id = editingAdmin.value._id || (editingAdmin.value as any).id;
			if (!formState.password) delete submitData.password;
		}
		await saveAdmin(submitData);
		message.success(editingAdmin.value ? "修改成功" : "添加成功");
		showModal.value = false;
		fetchAdmins();
	} catch (error: any) {
		message.error(error.message || "操作失败");
	} finally {
		loading.value = false;
	}
};

const handleDelete = (admin: AdminUser) => {
	if (admin.adminName === "admin" || admin.adminName === "yuma") return message.warning("系统核心账号禁止删除");
	const id = admin._id || (admin as any).id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除管理员"${admin.adminName}"吗？`,
		onOk: async () => {
			try {
				await deleteAdmin(id);
				message.success("删除成功");
				fetchAdmins();
			} catch (error: any) {
				message.error("删除失败");
			}
		},
	});
};

const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "批量删除确认",
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个账号吗？`,
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchAdmins();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">管理员管理</h1>
      <div class="flex gap-2">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索用户名/昵称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="() => { editingAdmin = null; Object.assign(formState, { id: '', adminName: '', password: '', nickName: '', avatar: '', role: 'merchant' }); showModal = true; }">
          <PlusOutlined /> 添加管理员
        </a-button>
      </div>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div v-if="selectedRowKeys.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
        <span class="text-blue-600 text-sm font-medium">已选择 {{ selectedRowKeys.length }} 项</span>
        <a-space>
          <a-button size="small" type="link" @click="selectedRowKeys = []">取消选择</a-button>
          <a-button size="small" type="primary" danger @click="handleBatchDelete">批量删除</a-button>
        </a-space>
      </div>

      <a-table
        :columns="displayedColumns"
        :data-source="adminData"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条`,
          size: isMobile ? 'small' : 'default',
        }"
        row-key="_id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="getFileUrl(record.avatar, record._id || record.id, 'admin/avatar')" :size="32">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '超级管理员' : '商家' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="4">
              <a-button type="link" size="small" @click="() => { editingAdmin = record; Object.assign(formState, { adminName: record.adminName, password: '', nickName: record.nickName || '', avatar: record.avatar || '', role: record.role }); showModal = true; }">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)" :disabled="record.adminName === 'admin' || record.adminName === 'yuma'">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="showModal" :title="editingAdmin ? '编辑管理员' : '添加管理员'" @ok="handleSubmit" :confirm-loading="loading">
      <a-form layout="vertical">
        <a-form-item label="头像">
          <FileUpload 
            v-model:value="formState.avatar" 
            directory="admin/avatar"
            :contextId="formState.id || (editingAdmin?._id || editingAdmin?.id)"
          />
        </a-form-item>
        <a-form-item label="用户名" required><a-input v-model:value="formState.adminName" :disabled="!!editingAdmin" /></a-form-item>
        <a-form-item :label="editingAdmin ? '修改密码 (留空则不修改)' : '密码'" :required="!editingAdmin"><a-input-password v-model:value="formState.password" /></a-form-item>
        <a-form-item label="昵称"><a-input v-model:value="formState.nickName" /></a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="formState.role">
            <a-select-option value="admin">超级管理员</a-select-option>
            <a-select-option value="merchant">商家</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
