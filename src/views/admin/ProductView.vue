<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	SaveOutlined,
	SearchOutlined,
	StockOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import {
	deleteSku,
	deleteSpu,
	getAllCategoryList,
	getAllTrademark,
	getSkuDetail,
	getSkuList,
	getSpuDetail,
	getSpuList,
	getSpuSaleAttrList,
	saveSku,
	saveSpu,
	toggleSkuSale,
} from "@/api";
import { getFileUrl } from "@/api/request";
import type { Category, Sku, Spu, SpuSaleAttr, Trademark } from "@/api/types";

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
	trademarkId: "",
	shopId: "",
	category1Id: "",
	category2Id: "",
	categoryId: "",
	images: [] as string[],
	showFlag: 1,
	sort: 0,
});

// 多选相关
const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
}));

const columns = computed(() => {
	const base = [
		{ title: "图片", dataIndex: "images", key: "images", width: 80 },
		{ title: "商品名称", dataIndex: "name", key: "name", minWidth: 150 },
		{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 80 },
		{
			title: "操作",
			key: "action",
			width: isMobile.value ? 120 : 220,
			fixed: isMobile.value ? undefined : "right",
		},
	];

	if (isMobile.value) {
		return base;
	}

	return [
		{ title: "ID", dataIndex: "_id", key: "_id", width: 200 },
		...base.slice(0, 2),
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			ellipsis: true,
		},
		base[2],
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 180,
		},
		base[3],
	];
});

// 加载数据
const fetchProducts = async () => {
	loading.value = true;
	try {
		const res = await getSpuList({
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		const data = res as any;
		const list = data.spuList || (data.data && data.data.spuList) || [];
		spuData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));
		pagination.total = data.count || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("加载商品列表失败:", error);
		message.error("加载商品列表失败");
	} finally {
		loading.value = false;
	}
};

// 打开新增/编辑SPU弹窗
const openSpuModal = (spu?: Spu) => {
	if (spu) {
		isEditingSpu.value = true;
		spuForm.id = spu._id || spu.id;
		spuForm.name = spu.name;
		spuForm.description = spu.description || "";
		spuForm.trademarkId = spu.trademarkId || "";
		spuForm.shopId = spu.shopId || "";
		spuForm.categoryId = spu.categoryId || "";
		spuForm.images = [...(spu.images || [])];
		spuForm.showFlag = spu.showFlag;
		spuForm.sort = spu.sort;
	} else {
		isEditingSpu.value = false;
		spuForm.id = "";
		spuForm.name = "";
		spuForm.description = "";
		spuForm.trademarkId = "";
		spuForm.shopId = "";
		spuForm.categoryId = "";
		spuForm.images = [];
		spuForm.showFlag = 1;
		spuForm.sort = 0;
	}
	showSpuModal.value = true;
};

// 提交SPU
const handleSubmitSpu = async () => {
	if (!spuForm.name) return message.warning("请输入商品名称");
	spuLoading.value = true;
	try {
		const formData = new FormData();
		if (isEditingSpu.value) formData.append("id", spuForm.id);
		formData.append("name", spuForm.name);
		formData.append("description", spuForm.description);
		formData.append("trademarkId", spuForm.trademarkId);
		formData.append("shopId", spuForm.shopId);
		formData.append("categoryId", spuForm.categoryId);
		formData.append("showFlag", String(spuForm.showFlag));
		formData.append("sort", String(spuForm.sort));
		spuForm.images.forEach((img) => formData.append("images", img));

		if (isEditingSpu.value) {
			await saveSpu(formData);
			message.success("修改成功");
		} else {
			await saveSpu(formData);
			message.success("添加成功");
		}
		showSpuModal.value = false;
		fetchProducts();
	} catch (error: any) {
		message.error(error.message || "操作失败");
	} finally {
		spuLoading.value = false;
	}
};

/**
 * 统一执行批量删除逻辑
 */
const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在执行批量删除...`, 0);
	let successCount = 0;
	for (const id of ids) {
		try {
			await deleteSpu(id);
			successCount++;
		} catch (e) {}
	}
	hide();
	message.success(`成功删除 ${successCount} 个商品`);
	fetchProducts();
};

// 删除单条SPU
const handleDeleteSpu = (record: Spu) => {
	const id = record._id || record.id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除商品"${record.name}"吗？这将删除其下的所有SKU。`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteSpu(id);
				message.success("删除成功");
				fetchProducts();
			} catch (error: any) {
				message.error(error.message || "删除失败");
			}
		},
	});
};

// 批量删除SPU
const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "批量删除确认",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个商品吗？此操作不可恢复。`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

// 切换SPU显示状态
const toggleSpu = async (record: Spu) => {
	const newFlag = record.showFlag === 1 ? 0 : 1;
	try {
		await saveSpu({
			id: record._id || record.id,
			showFlag: newFlag,
		} as any);
		message.success("状态更新成功");
		fetchProducts();
	} catch (error: any) {
		message.error(error.message || "更新失败");
	}
};

// SKU 相关
const showSkuListModal = ref(false);
const skuLoading = ref(false);
const skuData = ref<Sku[]>([]);
const currentSpu = ref<Spu | null>(null);

const skuColumns = [
	{ title: "图片", dataIndex: "defaultImg", key: "defaultImg", width: 60 },
	{ title: "SKU名称", dataIndex: "name", key: "name" },
	{ title: "价格", dataIndex: "price", key: "price", width: 100 },
	{ title: "操作", key: "action", width: 80 },
];

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
      <a-button type="primary" @click="openSpuModal()">
        <PlusOutlined /> 添加商品 (SPU)
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
              :src="getFileUrl(record.images?.[0])"
              :width="48"
              :height="48"
              style="object-fit: cover; border-radius: 4px"
            />
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
              <a-button type="link" size="small" @click="viewSku(record)" class="px-1">
                <template #icon><StockOutlined /></template>
                <span v-if="!isMobile">SKU管理</span>
              </a-button>
              <a-button type="link" size="small" @click="openSpuModal(record)" class="px-1">
                <template #icon><EditOutlined /></template>
                <span v-if="!isMobile">编辑</span>
              </a-button>
              <a-button type="link" size="small" danger @click="handleDeleteSpu(record)" class="px-1">
                <template #icon><DeleteOutlined /></template>
                <span v-if="!isMobile">删除</span>
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- SPU新增/编辑弹窗 -->
    <a-modal
      v-model:open="showSpuModal"
      :title="isEditingSpu ? '编辑商品' : '添加商品'"
      @ok="handleSubmitSpu"
      :confirm-loading="spuLoading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form layout="vertical">
        <a-form-item label="商品名称" required>
          <a-input v-model:value="spuForm.name" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item label="商品描述">
          <a-textarea v-model:value="spuForm.description" placeholder="请输入商品描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- SKU管理弹窗 -->
    <a-modal
      v-model:open="showSkuListModal"
      :title="`SKU列表 - ${currentSpu?.name}`"
      :width="isMobile ? '95%' : '800px'"
      :footer="null"
    >
      <a-table
        :columns="skuColumns"
        :data-source="skuData"
        :loading="skuLoading"
        :pagination="false"
        size="small"
        row-key="_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'defaultImg'">
            <a-image :src="getFileUrl(record.defaultImg)" :width="36" />
          </template>
          <template v-if="column.key === 'price'">
            <span class="text-red-500">¥{{ (record.price / 100).toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" danger @click="handleDeleteSku(record)">删除</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
