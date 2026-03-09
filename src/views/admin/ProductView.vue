<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  getSpuList,
  deleteSpu,
  getSkuList,
  toggleSkuSale,
} from '@/api/admin';
import type { Spu, Sku } from '@/api/admin';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StockOutlined,
} from '@ant-design/icons-vue';

const loading = ref(false);
const productData = ref<Spu[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const searchName = ref('');
const showSkuModal = ref(false);
const currentSpu = ref<Spu | null>(null);
const skuData = ref<Sku[]>([]);
const skuLoading = ref(false);

const columns = [
  { title: 'ID', dataIndex: '_id', key: '_id', width: 220 },
  { title: '商品图片', dataIndex: 'images', key: 'images', width: 100 },
  { title: '商品名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', dataIndex: 'showFlag', key: 'showFlag', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 200 },
];

const skuColumns = [
  { title: 'ID', dataIndex: '_id', key: '_id', width: 220 },
  { title: 'SKU图片', dataIndex: 'defaultImg', key: 'defaultImg', width: 80 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '价格', dataIndex: 'price', key: 'price', width: 100 },
  { title: '状态', dataIndex: 'isSale', key: 'isSale', width: 100 },
  { title: '操作', key: 'action', width: 100 },
];

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await getSpuList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
    if (res.code === 200 && res.spuList) {
      productData.value = res.spuList;
      pagination.total = res.count || res.spuList.length;
    }
  } catch {
    message.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchProducts();
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchProducts();
};

// 查看SKU
const viewSku = async (spu: Spu) => {
  currentSpu.value = spu;
  showSkuModal.value = true;
  skuLoading.value = true;
  try {
    const res = await getSkuList({
      pageNo: 1,
      pageSize: 100,
    });
    if (res.code === 200 && res.skuList) {
      // 过滤当前SPU的SKU
      skuData.value = res.skuList.filter((sku: Sku) => sku.spuId === spu._id);
    }
  } catch {
    message.error('获取SKU列表失败');
  } finally {
    skuLoading.value = false;
  }
};

// 上下架SKU
const toggleSku = async (sku: Sku) => {
  const newStatus = sku.isSale === 1 ? 0 : 1;
  try {
    await toggleSkuSale(sku._id, newStatus);
    message.success(newStatus === 1 ? '上架成功' : '下架成功');
    if (currentSpu.value) {
      viewSku(currentSpu.value);
    }
  } catch {
    message.error('操作失败');
  }
};

// 删除商品
const handleDelete = (product: Spu) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品"${product.name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteSpu(product._id);
        message.success('删除成功');
        fetchProducts();
      } catch {
        message.error('删除失败');
      }
    },
  });
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">商品管理</h1>
      <a-button type="primary">
        <PlusOutlined />
        添加商品
      </a-button>
    </div>

    <!-- 搜索栏 -->
    <a-card>
      <div class="flex items-center gap-4">
        <a-input
          v-model:value="searchName"
          placeholder="请输入商品名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <!-- 商品表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="productData"
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
          <template v-if="column.key === 'images'">
            <a-image
              v-if="record.images && record.images.length > 0"
              :src="record.images[0]"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px"
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
              <a-button type="link" size="small" @click="viewSku(record)">
                <EyeOutlined />
                SKU
              </a-button>
              <a-button type="link" size="small">
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

    <!-- SKU 弹窗 -->
    <a-modal
      v-model:open="showSkuModal"
      :title="`SKU列表 - ${currentSpu?.name || ''}`"
      width="900px"
      :footer="null"
    >
      <a-table
        :columns="skuColumns"
        :data-source="skuData"
        :loading="skuLoading"
        :pagination="false"
        row-key="_id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'defaultImg'">
            <a-image
              :src="record.defaultImg"
              :width="40"
              :height="40"
              style="object-fit: cover; border-radius: 4px"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>
          <template v-if="column.key === 'price'">
            <span class="text-red-500">¥{{ record.price }}</span>
          </template>
          <template v-if="column.key === 'isSale'">
            <a-tag :color="record.isSale === 1 ? 'green' : 'default'">
              {{ record.isSale === 1 ? '已上架' : '已下架' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              size="small"
              @click="toggleSku(record)"
            >
              <StockOutlined />
              {{ record.isSale === 1 ? '下架' : '上架' }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>