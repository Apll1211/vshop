<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  getAllCategoryList,
  createCategory,
  updateCategory,
  updateCategoryShowFlag,
  deleteCategory,
} from '@/api';
import type { Category } from '@/api/types';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const categoryData = ref<Category[]>([]);
const showModal = ref(false);
const editingCategory = ref<Category | null>(null);
const formState = ref({
  name: '',
  parentId: '',
  sort: 0,
});

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name', width: 300 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 100 },
  { title: '状态', dataIndex: 'showFlag', key: 'showFlag', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 200 },
];

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await getAllCategoryList();
    if (res.code === 200 && res.categoryList) {
      categoryData.value = res.categoryList;
    }
  } catch {
    message.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

// 打开新增/编辑弹窗
const openModal = (category?: Category) => {
  if (category) {
    editingCategory.value = category;
    formState.value = {
      name: category.name,
      parentId: category.parentId || '',
      sort: category.sort,
    };
  } else {
    editingCategory.value = null;
    formState.value = {
      name: '',
      parentId: '',
      sort: 0,
    };
  }
  showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formState.value.name) {
    message.warning('请输入分类名称');
    return;
  }

  try {
    if (editingCategory.value) {
      await updateCategory({
        id: editingCategory.value._id,
        name: formState.value.name,
        sort: formState.value.sort,
      });
      message.success('修改成功');
    } else {
      await createCategory({
        name: formState.value.name,
        parentId: formState.value.parentId || undefined,
        sort: formState.value.sort,
      });
      message.success('添加成功');
    }
    showModal.value = false;
    fetchCategories();
  } catch {
    message.error('操作失败');
  }
};

// 切换显示状态
const toggleShowFlag = async (category: Category) => {
  const newFlag = category.showFlag === 1 ? 0 : 1;
  try {
    await updateCategoryShowFlag(category._id, newFlag);
    message.success(newFlag === 1 ? '已显示' : '已隐藏');
    fetchCategories();
  } catch {
    message.error('操作失败');
  }
};

// 删除分类
const handleDelete = (category: Category) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分类"${category.name}"吗？删除后不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteCategory(category._id);
        message.success('删除成功');
        fetchCategories();
      } catch {
        message.error('删除失败');
      }
    },
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">分类管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加分类
      </a-button>
    </div>

    <!-- 分类表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="categoryData"
        :loading="loading"
        :pagination="false"
        row-key="_id"
        default-expand-all-rows
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'showFlag'">
            <a-tag :color="record.showFlag === 1 ? 'green' : 'default'">
              {{ record.showFlag === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="toggleShowFlag(record)">
                <EyeOutlined v-if="record.showFlag === 0" />
                <EyeInvisibleOutlined v-else />
                {{ record.showFlag === 1 ? '隐藏' : '显示' }}
              </a-button>
              <a-button type="link" size="small" @click="openModal(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
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
      :title="editingCategory ? '编辑分类' : '添加分类'"
      @ok="handleSubmit"
      :confirm-loading="loading"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="分类名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
