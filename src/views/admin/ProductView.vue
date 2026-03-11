<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	StockOutlined,
	SearchOutlined,
	ClearOutlined,
	ReloadOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import {
	deleteSku,
	deleteSpu,
	getSkuList,
	getSpuList,
	saveSpu,
} from "@/api";
import { getFileUrl } from "@/api/request";
import type { Sku, Spu } from "@/api/types";
import FileUpload from "@/components/FileUpload.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

// SPU 相关
const loading = ref(false);
const spuData = ref<Spu[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchName = ref("");
const showSpuModal = ref(false);
const isEditingSpu = ref(false);
const spuLoading = ref(false);

const spuForm = reactive({
	id: "",
	name: "",
	description: "",
	images: [] as string[],
	showFlag: 1,
});

// 多选相关
const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
}));

const columns = computed(() => [
	{ title: "图片", dataIndex: "images", key: "images", width: 80, align: 'center' },
	{ title: "商品名称", dataIndex: "name", key: "name", minWidth: 150 },
	{ title: "描述", dataIndex: "description", key: "description", minWidth: 200 },
	{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 80, align: 'center' },
	{ title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
	{ title: "操作", key: "action", width: 220 },
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		return columns.value.filter((col) => ["images", "name", "showFlag", "action"].includes(col.key as string));
	}
	return columns.value;
});

// SKU 相关
const showSkuListModal = ref(false);
const skuLoading = ref(false);
const skuData = ref<Sku[]>([]);
const currentSpu = ref<Spu | null>(null);

const skuColumns = computed(() => [
	{ title: "图片", dataIndex: "defaultImg", key: "defaultImg", width: 80, align: 'center' },
	{ title: "SKU名称", dataIndex: "name", key: "name", minWidth: 200 },
	{ title: "价格", dataIndex: "price", key: "price", width: 100 },
	{ title: "操作", key: "action", width: 80 },
]);

// 获取商品列表
const fetchProducts = async () => {
	loading.value = true;
	try {
		const res = await getSpuList({
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
			name: searchName.value || undefined,
		});
		const data = res as any;
		const list = data.spuList || (data.data && data.data.spuList) || data.list || (data.data && data.data.list) || [];

		spuData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));

		pagination.total = data.count || (data.data && data.data.count) || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		message.error("获取商品列表失败");
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pagination.current = 1;
	fetchProducts();
};

const handleReset = () => {
	searchName.value = "";
	pagination.current = 1;
	fetchProducts();
};

const openSpuModal = (spu?: Spu) => {
	isEditingSpu.value = !!spu;
	if (spu) {
		Object.assign(spuForm, {
			id: spu._id || spu.id,
			name: spu.name,
			description: spu.description,
			images: Array.isArray(spu.images) ? [...spu.images] : [],
			showFlag: spu.showFlag,
		});
	} else {
		Object.assign(spuForm, {
			id: "",
			name: "",
			description: "",
			images: [],
			showFlag: 1,
		});
	}
	showSpuModal.value = true;
};

const handleSubmitSpu = async () => {
	if (!spuForm.name) return message.warning("请输入商品名称");
	spuLoading.value = true;
	try {
		await saveSpu(spuForm as any);
		message.success(isEditingSpu.value ? "修改成功" : "添加成功");
		showSpuModal.value = false;
		fetchProducts();
	} catch (e: any) {
		message.error(e.message || "操作失败");
	} finally {
		spuLoading.value = false;
	}
};

const toggleSpu = async (spu: Spu) => {
	try {
		const newStatus = spu.showFlag === 1 ? 0 : 1;
		await saveSpu({ ...spu, id: spu._id || spu.id, showFlag: newStatus } as any);
		message.success("状态已更新");
		fetchProducts();
	} catch {
		message.error("状态更新失败");
	}
};

const handleDeleteSpu = (spu: any) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除商品"${spu.name}"吗？这将同时删除其下所有SKU。`,
		onOk: async () => {
			try {
				await deleteSpu(spu._id || spu.id);
				message.success("删除成功");
				fetchProducts();
			} catch {
				message.error("删除失败");
			}
		},
	});
};

const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "确认批量删除",
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个商品吗？`,
		onOk: async () => {
			const hide = message.loading("正在删除...", 0);
			try {
				await Promise.all(selectedRowKeys.value.map((id) => deleteSpu(id)));
				message.success("批量删除成功");
				fetchProducts();
			} catch {
				message.error("部分删除失败");
			} finally {
				hide();
			}
		},
	});
};

const viewSku = async (spu: Spu) => {
	currentSpu.value = spu;
	showSkuListModal.value = true;
	skuLoading.value = true;
	try {
		const res = await getSkuList({ spuId: spu._id || spu.id });
		const data = res as any;
		skuData.value = data.skuList || (data.data && data.data.skuList) || [];
	} catch (error) {
		message.error("获取SKU列表失败");
	} finally {
		skuLoading.value = false;
	}
};

const handleDeleteSku = (sku: Sku) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除SKU"${sku.name}"吗？`,
		onOk: async () => {
			try {
				await deleteSku(sku._id || sku.id);
				message.success("删除成功");
				if (currentSpu.value) viewSku(currentSpu.value);
			} catch {
				message.error("删除失败");
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
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">商品管理</h1>
      <div class="flex gap-2">
        <a-input
          v-model:value="searchName"
          placeholder="请输入商品名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="openSpuModal()">
          <PlusOutlined /> 添加商品
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
        :data-source="spuData"
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
        @change="(pag: any) => { pagination.current = pag.current; pagination.pageSize = pag.pageSize; fetchProducts(); }"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'images'">
            <a-image
              v-if="record.images?.[0]"
              :src="getFileUrl(record.images[0], undefined, 'spu')"
              :width="48"
              :height="48"
              style="object-fit: cover; border-radius: 4px"
            />
            <span v-else class="text-slate-300">无图片</span>
          </template>
          <template v-if="column.key === 'showFlag'">
            <a-switch
              :checked="record.showFlag === 1"
              size="small"
              @change="() => toggleSpu(record)"
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="viewSku(record)">SKU</a-button>
              <a-button type="link" size="small" @click="openSpuModal(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDeleteSpu(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="showSpuModal" :title="isEditingSpu ? '编辑商品' : '添加商品'" @ok="handleSubmitSpu" :confirm-loading="spuLoading">
      <a-form layout="vertical">
        <a-form-item label="商品图片"><FileUpload v-model:value="spuForm.images" :maxCount="5" /></a-form-item>
        <a-form-item label="商品名称" required><a-input v-model:value="spuForm.name" /></a-form-item>
        <a-form-item label="商品描述"><a-textarea v-model:value="spuForm.description" :rows="3" /></a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="showSkuListModal" :title="`SKU列表 - ${currentSpu?.name}`" :width="800" :footer="null">
      <a-table :columns="skuColumns" :data-source="skuData" :loading="skuLoading" :pagination="false" size="small" row-key="_id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'defaultImg'"><a-image :src="getFileUrl(record.defaultImg, undefined, 'spu')" :width="36" /></template>
          <template v-if="column.key === 'price'"><span class="text-red-500">¥{{ (record.price / 100).toFixed(2) }}</span></template>
          <template v-if="column.key === 'action'"><a-button type="link" size="small" danger @click="handleDeleteSku(record)">删除</a-button></template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
