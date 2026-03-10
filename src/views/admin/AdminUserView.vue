<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	UserOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { createAdmin, deleteAdmin, getAdminList, updateAdmin } from "@/api";
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
const formState = ref({
	adminName: "",
	password: "",
	nickName: "",
	avatar: "",
	role: "merchant" as "admin" | "merchant",
});

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
		// 移动端隐藏 头像, 角色, 创建时间
		return allColumns.filter(col => !['avatar', 'role', 'createTime'].includes(col.key as string));
	}
	return allColumns;
});

// 获取管理员列表
const fetchAdmins = async () => {
	loading.value = true;
	try {
		const res = await getAdminList();
		if (res.code === 200 && res.adminList) {
			adminData.value = res.adminList;
			pagination.total = res.adminList.length;
		}
	} catch {
		message.error("获取管理员列表失败");
	} finally {
		loading.value = false;
	}
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	// 后端接口目前似乎不支持分页查询管理员列表，这里仅做前端模拟或维持现状
};

// 打开新增/编辑弹窗
const openModal = (admin?: AdminUser) => {
	if (admin) {
		editingAdmin.value = admin;
		formState.value = {
			adminName: admin.adminName,
			password: "",
			nickName: admin.nickName || "",
			avatar: admin.avatar || "",
			role: admin.role,
		};
	} else {
		editingAdmin.value = null;
		formState.value = {
			adminName: "",
			password: "",
			nickName: "",
			avatar: "",
			role: "merchant",
		};
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!editingAdmin.value) {
		if (!formState.value.adminName) return message.warning("请输入用户名");
		if (!formState.value.password) return message.warning("请输入密码");
	}

	loading.value = true;
	try {
		if (editingAdmin.value) {
			const updateData: any = {
				nickName: formState.value.nickName,
				avatar: formState.value.avatar,
				role: formState.value.role,
			};
			if (formState.value.password) {
				updateData.password = formState.value.password;
			}
			const res = await updateAdmin(editingAdmin.value._id, updateData);
			if (res.code === 200) {
				message.success("修改成功");
				showModal.value = false;
				fetchAdmins();
			} else {
				message.error(res.message || "修改失败");
			}
		} else {
			const res = await createAdmin({
				adminName: formState.value.adminName,
				password: formState.value.password,
				nickName: formState.value.nickName,
				avatar: formState.value.avatar,
				role: formState.value.role,
			});
			if (res.code === 200) {
				message.success("添加成功");
				showModal.value = false;
				fetchAdmins();
			} else {
				message.error(res.message || "添加失败");
			}
		}
	} catch (error: any) {
		message.error(error.response?.data?.message || "操作失败");
	} finally {
		loading.value = false;
	}
};

// 删除管理员
const handleDelete = (admin: AdminUser) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除管理员"${admin.adminName}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				const res = await deleteAdmin(admin._id);
				if (res.code === 200) {
					message.success("删除成功");
					fetchAdmins();
				} else {
					message.error(res.message || "删除失败");
				}
			} catch (error: any) {
				message.error(error.response?.data?.message || "删除失败");
			}
		},
	});
};

onMounted(() => {
	fetchAdmins();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">管理员管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加管理员
      </a-button>
    </div>

    <!-- 管理员表格 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <a-table
        :columns="columns"
        :data-source="adminData"
        :loading="loading"
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
              <a-button type="link" size="small" @click="openModal(record)" class="px-1">
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

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="showModal"
      :title="editingAdmin ? '编辑管理员' : '添加管理员'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="用户名" :rules="[{ required: true }]">
          <a-input 
            v-model:value="formState.adminName" 
            placeholder="请输入用户名" 
            :disabled="!!editingAdmin"
          />
        </a-form-item>
        <a-form-item :label="editingAdmin ? '修改密码 (留空则不修改)' : '密码'" :rules="[{ required: !editingAdmin }]">
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
