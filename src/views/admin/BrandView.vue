<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  getTrademarkList,
  createTrademark,
  updateTrademark,
  deleteTrademark,
} from '@/api';
import type { Trademark } from '@/api/types';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const brandData = ref<Trademark[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const searchName = ref('');
const showModal = ref(false);
const editingBrand = ref<Trademark | null>(null);
const formState = ref({
  name: '',
  logo: '',
  sort: 0,
});

const columns = [
  { title: 'ID', dataIndex: '_id', key: '_id', width: 220 },
  { title: 'Logo', dataIndex: 'logo', key: 'logo', width: 100 },
  { title: '品牌名称', dataIndex: 'name', key: 'name' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', dataIndex: 'showFlag', key: 'showFlag', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 },
];

// 获取品牌列表
const fetchBrands = async () => {
  loading.value = true;
  try {
    const res = await getTrademarkList({
      keyword: searchName.value || undefined,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
    if (res.code === 200 && res.trademarkList) {
      brandData.value = res.trademarkList;
      // API返回分页信息
      pagination.total = res.count || res.trademarkList.length;
    }
  } catch {
    message.error('获取品牌列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchBrands();
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchBrands();
};

// 打开新增/编辑弹窗
const openModal = (brand?: Trademark) => {
  if (brand) {
    editingBrand.value = brand;
    formState.value = {
      name: brand.name,
      logo: brand.logo,
      sort: brand.sort,
    };
  } else {
    editingBrand.value = null;
    formState.value = {
      name: '',
      logo: '',
      sort: 0,
    };
  }
  showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formState.value.name) {
    message.warning('请输入品牌名称');
    return;
  }
  if (!formState.value.logo) {
    message.warning('请输入Logo地址');
    return;
  }

  try {
    if (editingBrand.value) {
      const formData = new FormData();
      formData.append('id', editingBrand.value._id);
      formData.append('name', formState.value.name);
      formData.append('logo', formState.value.logo);
      formData.append('sort', String(formState.value.sort));
      await updateTrademark(formData);
      message.success('修改成功');
    } else {
      const formData = new FormData();
      formData.append('name', formState.value.name);
      formData.append('logo', formState.value.logo);
      formData.append('sort', String(formState.value.sort));
      await createTrademark(formData);
      message.success('添加成功');
    }
    showModal.value = false;
    fetchBrands();
  } catch {
    message.error('操作失败');
  }
};

// 删除品牌
const handleDelete = (brand: Trademark) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除品牌"${brand.name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteTrademark(brand._id);
        message.success('删除成功');
        fetchBrands();
      } catch {
        message.error('删除失败');
      }
    },
  });
};

onMounted(() => {
  fetchBrands();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">品牌管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加品牌
      </a-button>
    </div>

    <!-- 搜索栏 -->
    <a-card>
      <div class="flex items-center gap-4">
        <a-input
          v-model:value="searchName"
          placeholder="请输入品牌名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <!-- 品牌表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="brandData"
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
          <template v-if="column.key === 'logo'">
            <a-image
              :src="record.logo"
              :width="60"
              :height="40"
              style="object-fit: contain"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>
          <template v-if="column.key === 'showFlag'">
            <a-tag :color="record.showFlag === 1 ? 'green' : 'default'">
              {{ record.showFlag === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
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
      :title="editingBrand ? '编辑品牌' : '添加品牌'"
      @ok="handleSubmit"
      :confirm-loading="loading"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="品牌名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入品牌名称" />
        </a-form-item>
        <a-form-item label="Logo地址" required>
          <a-input v-model:value="formState.logo" placeholder="请输入Logo图片地址" />
          <div v-if="formState.logo" class="mt-2">
            <a-image :src="formState.logo" :width="100" />
          </div>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
