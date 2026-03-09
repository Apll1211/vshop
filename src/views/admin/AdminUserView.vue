<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '@/api/admin';
import type { AdminUser } from '@/api/admin';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

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
  adminName: '',
  password: '',
  nickname: '',
  email: '',
  role: 'merchant',
});

const columns = [
  { title: 'ID', dataIndex: '_id', key: '_id', width: 220 },
  { title: '用户名', dataIndex: 'adminName', key: 'adminName' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 },
];

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
    message.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchAdmins();
};

// 打开新增/编辑弹窗
const openModal = (admin?: AdminUser) => {
  if (admin) {
    editingAdmin.value = admin;
      formState.value = {
      adminName: admin.adminName,
      password: '',
      nickname: admin.nickName || '',
      email: admin.email || '',
      role: admin.role,
    };
  } else {
    editingAdmin.value = null;
    formState.value = {
      adminName: '',
      password: '',
      nickname: '',
      email: '',
      role: 'merchant',
    };
  }
  showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!editingAdmin.value && !formState.value.adminName) {
    message.warning('请输入用户名');
    return;
  }
  if (!editingAdmin.value && !formState.value.password) {
    message.warning('请输入密码');
    return;
  }

  try {
    if (editingAdmin.value) {
      await updateAdmin(editingAdmin.value._id, {
        nickname: formState.value.nickname,
        email: formState.value.email,
        role: formState.value.role as 'admin' | 'merchant',
      });
      message.success('修改成功');
    } else {
      await createAdmin({
        adminName: formState.value.adminName,
        password: formState.value.password,
        role: formState.value.role,
      });
      message.success('添加成功');
    }
    showModal.value = false;
    fetchAdmins();
  } catch {
    message.error('操作失败');
  }
};

// 删除管理员
const handleDelete = (admin: AdminUser) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除管理员"${admin.adminName}"吗？`,
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteAdmin(admin._id);
        message.success('删除成功');
        fetchAdmins();
      } catch {
        message.error('删除失败');
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
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">管理员管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加管理员
      </a-button>
    </div>

    <!-- 管理员表格 -->
    <a-card>
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
        }"
        row-key="_id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '超级管理员' : '商家' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openModal(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete(record)"
                :disabled="record.role === 'admin'"
              >
                <DeleteOutlined />
                删除
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
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="用户名" v-if="!editingAdmin">
          <a-input v-model:value="formState.adminName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码" v-if="!editingAdmin">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model:value="formState.nickname" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
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
