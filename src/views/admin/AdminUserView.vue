<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	UserOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref, computed, createVNode } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { createAdmin, deleteAdmin, getAdminList, updateAdmin } from "@/api";
import { getFileUrl } from "@/api/request";
import type { AdminUser } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller('md').value);

const loading = ref(false);
const adminData = ref<AdminUser[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const showModal = ref(false);
const editingAdmin = ref<AdminUser | null>(null);
const formState = reactive({
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
		disabled: record.adminName === 'admin' || record.adminName === 'yuma',
		name: record.adminName,
	}),
}));

const columns = computed(() => {
	const allColumns = [
		{ title: "头像", dataIndex: "avatar", key: "avatar", width: 80 },
		{ title: "用户名", dataIndex: "adminName", key: "adminName", minWidth: 100 },
		{ title: "昵称", dataIndex: "nickName", key: "nickName", minWidth: 100 },
		{ title: "角色", dataIndex: "role", key: "role", width: 120 },
		{ title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
		{ title: "操作", key: "action", width: isMobile.value ? 100 : 180, fixed: isMobile.value ? undefined : 'right' },
	];

	if (isMobile.value) {
		return allColumns.filter(col => !['avatar', 'role', 'createTime'].includes(col.key as string));
	}
	return allColumns;
});

// 获取管理员列表
const fetchAdmins = async () => {
	loading.value = true;
	try {
		// 补全分页参数
		const res = await getAdminList();
		const data = res as any;
		// 后端管理员列表可能暂时没做物理分页，前端做个模拟切片以保证 UI 正常
		const list = data.adminList || (data.data && data.data.adminList) || [];
		
		const mappedList = list.map((item: any) => ({
			...item,
			_id: item._id || item.id
		}));

		// 如果后端没返回 total，则使用数组长度
		pagination.total = mappedList.length;
		
		// 前端切片处理（防止后端未分页时界面溢出）
		const start = (pagination.current - 1) * pagination.pageSize;
		const end = start + pagination.pageSize;
		adminData.value = mappedList.slice(start, end);
		
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取管理员列表失败:", error);
		message.error("获取管理员列表失败");
	} finally {
		loading.value = false;
	}
};

// 处理分页跳转
const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchAdmins();
};

/**
 * 统一执行批量删除逻辑
 */
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

// 提交表单
const handleSubmit = async () => {
	if (!editingAdmin.value) {
		if (!formState.adminName) return message.warning("请输入用户名");
		if (!formState.password) return message.warning("请输入密码");
	}

	loading.value = true;
	try {
		if (editingAdmin.value) {
			const updateData: any = {
				nickName: formState.nickName,
				avatar: formState.avatar,
				role: formState.role,
			};
			if (formState.password) {
				updateData.password = formState.password;
			}
			const id = editingAdmin.value._id || (editingAdmin.value as any).id;
			await updateAdmin(id, updateData);
			message.success("修改成功");
			showModal.value = false;
			fetchAdmins();
		} else {
			await createAdmin({
				adminName: formState.adminName,
				password: formState.password,
				nickName: formState.nickName,
				avatar: formState.avatar,
				role: formState.role,
			});
			message.success("添加成功");
			showModal.value = false;
			fetchAdmins();
		}
	} catch (error: any) {
		console.error("提交管理员失败:", error);
		message.error(error.message || "操作失败");
	} finally {
		loading.value = false;
	}
};

// 删除单条
const handleDelete = (admin: AdminUser) => {
	if (admin.adminName === 'admin' || admin.adminName === 'yuma') {
		return message.warning("系统核心账号禁止删除");
	}
	const id = admin._id || (admin as any).id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除管理员"${admin.adminName}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteAdmin(id);
				message.success("删除成功");
				fetchAdmins();
			} catch (error: any) {
				message.error(error.message || "删除失败");
			}
		},
	});
};

// 批量删除
const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "批量删除确认",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个管理员账号吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
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
      <a-button type="primary" @click="() => { editingAdmin = null; formState.adminName = ''; formState.password = ''; formState.nickName = ''; formState.avatar = ''; formState.role = 'merchant'; showModal = true; }">
        <PlusOutlined />
        添加管理员
      </a-button>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <!-- 批量操作工具栏 -->
      <div v-if="selectedRowKeys.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
        <span class="text-blue-600 text-sm font-medium">已选择 {{ selectedRowKeys.length }} 项</span>
        <a-space>
          <a-button size="small" type="link" @click="selectedRowKeys = []">取消选择</a-button>
          <a-button size="small" type="primary" danger @click="handleBatchDelete">
            <DeleteOutlined /> 批量删除
          </a-button>
        </a-space>
      </div>

      <a-table
        :columns="columns"
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
            <a-avatar :src="record.avatar" :size="isMobile ? 'small' : 'default'">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '超级管理员' : '商家' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="() => { editingAdmin = record; formState.adminName = record.adminName; formState.password = ''; formState.nickName = record.nickName || ''; formState.avatar = record.avatar || ''; formState.role = record.role; showModal = true; }">
                <template #icon><EditOutlined /></template>
                <span v-if="!isMobile">编辑</span>
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete(record)"
                :disabled="record.adminName === 'admin' || record.adminName === 'yuma'"
                class="px-1"
              >
                <template #icon><DeleteOutlined /></template>
                <span v-if="!isMobile">删除</span>
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="showModal"
      :title="editingAdmin ? '编辑管理员' : '添加管理员'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form layout="vertical">
        <a-form-item label="用户名" required>
          <a-input 
            v-model:value="formState.adminName" 
            placeholder="请输入用户名" 
            :disabled="!!editingAdmin"
          />
        </a-form-item>
        <a-form-item :label="editingAdmin ? '修改密码 (留空则不修改)' : '密码'" :required="!editingAdmin">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model:value="formState.nickName" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="头像URL">
          <a-input v-model:value="formState.avatar" placeholder="请输入头像URL" />
        </a-form-item>
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
