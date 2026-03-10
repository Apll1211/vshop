<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	SaveOutlined,
	SearchOutlined,
	StockOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import {
	Form,
	Input,
	Modal,
	message,
	Select,
	Switch,
	Upload,
} from "ant-design-vue";
import { computed, onMounted, reactive, ref } from "vue";
import {
	createSku,
	createSpu,
	deleteSku,
	deleteSpu,
	getAllCategoryList,
	getAllTrademark,
	getSkuDetail,
	getSkuList,
	getSpuDetail,
	getSpuList,
	getSpuSaleAttrList,
	toggleSkuSale,
	updateSku,
	updateSpu,
} from "@/api";
import type { Category, Sku, Spu, SpuSaleAttr, Trademark } from "@/api/types";

const loading = ref(false);
const productData = ref<Spu[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchName = ref("");
const showSkuModal = ref(false);
const currentSpu = ref<Spu | null>(null);
const skuData = ref<Sku[]>([]);
// SKU加载状态
const skuLoading = ref(false);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

// 表格列定义
const columns = computed(() => {
	const base = [
		{ title: "图片", dataIndex: "images", key: "images", width: 80 },
		{ title: "名称", dataIndex: "name", key: "name", minWidth: 120 },
		{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 80 },
		{
			title: "操作",
			key: "action",
			width: isMobile.value ? 100 : 180,
			fixed: isMobile.value ? undefined : "right",
		},
	];
	if (!isMobile.value) {
		return [
			{ title: "ID", dataIndex: "_id", key: "_id", width: 200 },
			...base.slice(0, 2),
			{
				title: "描述",
				dataIndex: "description",
				key: "description",
				ellipsis: true,
			},
			...base.slice(2),
			{
				title: "创建时间",
				dataIndex: "createTime",
				key: "createTime",
				width: 180,
			},
		];
	}
	return base;
});

const skuColumns = computed(() => {
	const base = [
		{ title: "图片", dataIndex: "defaultImg", key: "defaultImg", width: 60 },
		{ title: "名称", dataIndex: "name", key: "name" },
		{ title: "价格", dataIndex: "price", key: "price", width: 80 },
		{ title: "操作", key: "action", width: isMobile.value ? 80 : 120 },
	];
	if (!isMobile.value) {
		return [
			{ title: "ID", dataIndex: "_id", key: "_id", width: 200 },
			...base.slice(0, 3),
			{ title: "状态", dataIndex: "isSale", key: "isSale", width: 100 },
			base[3],
		];
	}
	return base;
});

// SPU相关状态
const showSpuModal = ref(false);
const isEditingSpu = ref(false);
const spuForm = reactive({
	id: "",
	name: "",
	shopId: "",
	category1Id: "",
	category2Id: "",
	categoryId: "",
	description: "",
	trademarkId: "",
	showFlag: 1,
	sort: 0,
	images: [] as string[],
	existingImages: [] as string[],
	spuSaleAttrList: [] as SpuSaleAttr[],
});
const spuLoading = ref(false);
const categoryList = ref<Category[]>([]);
const trademarkList = ref<Trademark[]>([]);
const spuSaleAttrList = ref<SpuSaleAttr[]>([]);

// SKU相关状态
const showSkuManageModal = ref(false);
const isEditingSku = ref(false);
const skuForm = reactive({
	id: "",
	name: "",
	fullName: "",
	shopId: "",
	spuId: "",
	category1Id: "",
	category2Id: "",
	categoryId: "",
	price: 0,
	description: "",
	images: [] as string[],
	skuAttrValueList: [] as { attrId: string; valueId: string }[],
	skuSaleAttrValueList: [] as {
		attrId: string;
		valueId: string;
		valueName: string;
	}[],
	isSale: 1,
	sort: 0,
});
const skuAttrValueList = ref<
	{ attrId: string; valueId: string; valueName: string }[]
>([]);

// 获取商品列表
const fetchProducts = async () => {
	loading.value = true;
	try {
		const res = await getSpuList({
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		const data = res as any;
		if (data.code === 200 && data.spuList) {
			productData.value = data.spuList;
			pagination.total = data.count || data.spuList.length;
		}
	} catch {
		message.error("获取商品列表失败");
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
		const data = res as any;
		if (data.code === 200 && data.skuList) {
			// 过滤当前SPU的SKU
			skuData.value = data.skuList.filter((sku: Sku) => sku.spuId === spu._id);
		}
	} catch {
		message.error("获取SKU列表失败");
	} finally {
		skuLoading.value = false;
	}
};

// 上下架SKU
const toggleSku = async (sku: Sku) => {
	const newStatus = sku.isSale === 1 ? 0 : 1;
	try {
		await toggleSkuSale(sku._id, newStatus);
		message.success(newStatus === 1 ? "上架成功" : "下架成功");
		if (currentSpu.value) {
			viewSku(currentSpu.value);
		}
	} catch {
		message.error("操作失败");
	}
};

// 删除商品
const handleDelete = (product: Spu) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除商品"${product.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteSpu(product._id);
				message.success("删除成功");
				fetchProducts();
			} catch {
				message.error("删除失败");
			}
		},
	});
};

// ==================== SPU管理功能 ====================

// 打开添加SPU弹窗
const openAddSpuModal = async () => {
	isEditingSpu.value = false;
	resetSpuForm();
	await loadCategoriesAndTrademarks();
	showSpuModal.value = true;
};

// 打开编辑SPU弹窗
const openEditSpuModal = async (product: Spu) => {
	isEditingSpu.value = true;
	await loadCategoriesAndTrademarks();
	await loadSpuDetail(product._id);
	showSpuModal.value = true;
};

// 重置SPU表单
const resetSpuForm = () => {
	spuForm.id = "";
	spuForm.name = "";
	spuForm.shopId = "";
	spuForm.category1Id = "";
	spuForm.category2Id = "";
	spuForm.categoryId = "";
	spuForm.description = "";
	spuForm.trademarkId = "";
	spuForm.showFlag = 1;
	spuForm.sort = 0;
	spuForm.images = [];
	spuForm.existingImages = [];
	spuForm.spuSaleAttrList = [];
};

// 加载分类和品牌
const loadCategoriesAndTrademarks = async () => {
	try {
		const [catRes, tradeRes] = await Promise.all([
			getAllCategoryList(),
			getAllTrademark(),
		]);
		const catData = catRes as any;
		const tradeData = tradeRes as any;
		if (catData.code === 200 && catData.categoryList) {
			categoryList.value = catData.categoryList;
		}
		if (tradeData.code === 200 && tradeData.trademarkList) {
			trademarkList.value = tradeData.trademarkList;
		}
	} catch {
		message.error("加载分类和品牌失败");
	}
};

// 加载SPU详情
const loadSpuDetail = async (spuId: string) => {
	spuLoading.value = true;
	try {
		const res = await getSpuDetail(spuId);
		const data = res as any;
		if (data.code === 200 && data.info) {
			Object.assign(spuForm, {
				id: data.info._id,
				name: data.info.name,
				shopId: data.info.shopId || "",
				category1Id: data.info.category1Id || "",
				category2Id: data.info.category2Id || "",
				categoryId: data.info.categoryId || "",
				description: data.info.description || "",
				trademarkId: data.info.trademarkId || "",
				showFlag: data.info.showFlag,
				sort: data.info.sort,
				images: data.info.images || [],
				existingImages: data.info.images || [],
				spuSaleAttrList: data.info.spuSaleAttrList || [],
			});

			// 加载SPU销售属性
			if (data.info.spuSaleAttrList && data.info.spuSaleAttrList.length > 0) {
				spuSaleAttrList.value = data.info.spuSaleAttrList;
			}
		}
	} catch {
		message.error("加载SPU详情失败");
	} finally {
		spuLoading.value = false;
	}
};

// 获取SPU销售属性列表
const fetchSpuSaleAttrList = async (spuId: string) => {
	try {
		const res = await getSpuSaleAttrList(spuId);
		const data = res as any;
		if (data.code === 200 && data.spuSaleAttrList) {
			spuSaleAttrList.value = data.spuSaleAttrList;
		}
	} catch {
		message.error("获取SPU销售属性失败");
	}
};

// 分类变化
const handleCategoryChange = (value: string, level: number) => {
	if (level === 1) {
		spuForm.category1Id = value;
		spuForm.category2Id = "";
		spuForm.categoryId = "";
	} else if (level === 2) {
		spuForm.category2Id = value;
		spuForm.categoryId = "";
	} else if (level === 3) {
		spuForm.categoryId = value;
	}
};

// 品牌变化
const handleTrademarkChange = (value: string) => {
	spuForm.trademarkId = value;
};

// 添加销售属性
const addSaleAttr = () => {
	const newAttr: SpuSaleAttr = {
		_id: Date.now().toString(),
		name: "",
		valueList: [],
	};
	spuSaleAttrList.value.push(newAttr);
};

// 删除销售属性
const removeSaleAttr = (index: number) => {
	spuSaleAttrList.value.splice(index, 1);
};

// 添加属性值
const addAttrValue = (attrIndex: number) => {
	const attr = spuSaleAttrList.value[attrIndex];
	if (attr) {
		attr.valueList.push({ _id: Date.now().toString(), name: "" });
	}
};

// 删除属性值
const removeAttrValue = (attrIndex: number, valueIndex: number) => {
	const attr = spuSaleAttrList.value[attrIndex];
	if (attr) {
		attr.valueList.splice(valueIndex, 1);
	}
};

// 属性值变化
const handleAttrValueChange = (
	attrIndex: number,
	valueIndex: number,
	value: string,
) => {
	const attr = spuSaleAttrList.value[attrIndex];
	if (attr && attr.valueList[valueIndex]) {
		attr.valueList[valueIndex].name = value;
	}
};

// 图片上传
const handleSpuImageUpload = (file: File) => {
	const maxSize = 3 * 1024 * 1024; // 3MB
	if (file.size > maxSize) {
		message.error("图片大小不能超过3MB");
		return false;
	}
	return true;
};

const handleSpuImageChange = ({ fileList }: any) => {
	const newFiles = fileList
		.filter((file: any) => file.status === "done")
		.map((file: any) => file.response?.data?.url || file.url);
	spuForm.images = newFiles;
};

// 提交SPU
const handleSubmitSpu = async () => {
	if (!spuForm.name) {
		message.error("请输入商品名称");
		return;
	}

	spuLoading.value = true;
	try {
		const formData = new FormData();
		formData.append("name", spuForm.name);
		formData.append("shopId", spuForm.shopId);
		if (spuForm.categoryId) formData.append("categoryId", spuForm.categoryId);
		if (spuForm.category2Id)
			formData.append("category2Id", spuForm.category2Id);
		if (spuForm.category1Id)
			formData.append("category1Id", spuForm.category1Id);
		if (spuForm.description)
			formData.append("description", spuForm.description);
		if (spuForm.trademarkId)
			formData.append("trademarkId", spuForm.trademarkId);
		formData.append("showFlag", spuForm.showFlag.toString());
		formData.append("sort", spuForm.sort.toString());

		// 添加图片
		for (const img of spuForm.images) {
			formData.append("images", img);
		}

		// 添加销售属性列表
		formData.append("spuSaleAttrList", JSON.stringify(spuSaleAttrList.value));

		let res;
		if (isEditingSpu.value && spuForm.id) {
			res = await updateSpu(formData);
		} else {
			res = await createSpu(formData);
		}

		const data = res as any;
		if (data.code === 200) {
			message.success(isEditingSpu.value ? "修改成功" : "添加成功");
			showSpuModal.value = false;
			fetchProducts();
		} else {
			message.error(data.message || "操作失败");
		}
	} catch {
		message.error(isEditingSpu.value ? "修改失败" : "添加失败");
	} finally {
		spuLoading.value = false;
	}
};

// ==================== SKU管理功能 ====================

// 打开添加SKU弹窗
const openAddSkuModal = (spu: Spu) => {
	isEditingSku.value = false;
	resetSkuForm();
	skuForm.spuId = spu._id;
	skuForm.shopId = spu.shopId || "";
	showSkuManageModal.value = true;
};

// 打开编辑SKU弹窗
const openEditSkuModal = async (sku: Sku) => {
	isEditingSku.value = true;
	skuLoading.value = true;
	try {
		const res = await getSkuDetail(sku._id);
		const data = res as any;
		if (data.code === 200 && data.skuInfo) {
			Object.assign(skuForm, {
				id: data.skuInfo._id,
				name: data.skuInfo.name,
				fullName: data.skuInfo.fullName || "",
				shopId: data.skuInfo.shopId || "",
				spuId: data.skuInfo.spuId || "",
				category1Id: data.skuInfo.category1Id || "",
				category2Id: data.skuInfo.category2Id || "",
				categoryId: data.skuInfo.categoryId || "",
				price: data.skuInfo.price || 0,
				description: data.skuInfo.description || "",
				images: [],
				skuAttrValueList: [],
				skuSaleAttrValueList: data.skuInfo.skuSaleAttrValueList || [],
				isSale: data.skuInfo.isSale,
				sort: data.skuInfo.sort || 0,
			});

			// 加载SPU销售属性
			await fetchSpuSaleAttrList(skuForm.spuId);
		}
	} catch {
		message.error("加载SKU详情失败");
	} finally {
		skuLoading.value = false;
		showSkuManageModal.value = true;
	}
};

// 重置SKU表单
const resetSkuForm = () => {
	skuForm.id = "";
	skuForm.name = "";
	skuForm.fullName = "";
	skuForm.shopId = "";
	skuForm.spuId = "";
	skuForm.category1Id = "";
	skuForm.category2Id = "";
	skuForm.categoryId = "";
	skuForm.price = 0;
	skuForm.description = "";
	skuForm.images = [];
	skuForm.skuAttrValueList = [];
	skuForm.skuSaleAttrValueList = [];
	skuForm.isSale = 1;
	skuForm.sort = 0;
};

// SKU图片上传
const handleSkuImageUpload = (file: File) => {
	const maxSize = 3 * 1024 * 1024; // 3MB
	if (file.size > maxSize) {
		message.error("图片大小不能超过3MB");
		return false;
	}
	return true;
};

const handleSkuImageChange = ({ fileList }: any) => {
	const newFiles = fileList
		.filter((file: any) => file.status === "done")
		.map((file: any) => file.response?.data?.url || file.url);
	skuForm.images = newFiles;
};

// SKU属性值变化
const handleSkuAttrValueChange = (
	index: number,
	field: string,
	value: string,
) => {
	if (skuForm.skuSaleAttrValueList[index]) {
		skuForm.skuSaleAttrValueList[index][
			field as keyof (typeof skuForm.skuSaleAttrValueList)[0]
		] = value;
	}
};

// 提交SKU
const handleSubmitSku = async () => {
	if (!skuForm.name) {
		message.error("请输入SKU名称");
		return;
	}

	if (!skuForm.price) {
		message.error("请输入价格");
		return;
	}

	skuLoading.value = true;
	try {
		const formData = new FormData();
		formData.append("name", skuForm.name);
		formData.append("shopId", skuForm.shopId);
		formData.append("spuId", skuForm.spuId);
		if (skuForm.fullName) formData.append("fullName", skuForm.fullName);
		if (skuForm.categoryId) formData.append("categoryId", skuForm.categoryId);
		if (skuForm.category2Id)
			formData.append("category2Id", skuForm.category2Id);
		if (skuForm.category1Id)
			formData.append("category1Id", skuForm.category1Id);
		formData.append("price", skuForm.price.toString());
		if (skuForm.description)
			formData.append("description", skuForm.description);
		formData.append("isSale", skuForm.isSale.toString());
		formData.append("sort", skuForm.sort.toString());

		// 添加SKU属性值列表
		formData.append(
			"skuAttrValueList",
			JSON.stringify(skuForm.skuAttrValueList),
		);
		formData.append(
			"skuSaleAttrValueList",
			JSON.stringify(skuForm.skuSaleAttrValueList),
		);

		// 添加图片
		for (const img of skuForm.images) {
			formData.append("images", img);
		}

		let res;
		if (isEditingSku.value && skuForm.id) {
			res = await updateSku(formData);
		} else {
			res = await createSku(formData);
		}

		const data = res as any;
		if (data.code === 200) {
			message.success(isEditingSku.value ? "修改成功" : "添加成功");
			showSkuManageModal.value = false;
			if (currentSpu.value) {
				viewSku(currentSpu.value);
			}
		} else {
			message.error(data.message || "操作失败");
		}
	} catch {
		message.error(isEditingSku.value ? "修改失败" : "添加失败");
	} finally {
		skuLoading.value = false;
	}
};

// 删除SKU
const handleDeleteSku = (sku: Sku) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除SKU"${sku.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteSku(sku._id);
				message.success("删除成功");
				if (currentSpu.value) {
					viewSku(currentSpu.value);
				}
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
  <div class="space-y-4 pb-10">
    <!-- 页面标题 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-xl font-bold text-slate-800">商品管理</h1>
      <a-button type="primary" @click="openAddSpuModal" class="w-full sm:w-auto">
        <PlusOutlined />
        添加商品
      </a-button>
    </div>

    <!-- 搜索栏 -->
    <a-card :body-style="{ padding: '16px' }">
      <div class="flex flex-wrap items-center gap-3">
        <a-input
          v-model:value="searchName"
          placeholder="请输入商品名称"
          class="w-full sm:w-64"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined class="text-slate-400" /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch" class="w-full sm:w-auto">搜索</a-button>
      </div>
    </a-card>

    <!-- 商品表格 -->
    <a-card :body-style="{ padding: isMobile ? '0' : '24px' }">
      <a-table
        :columns="columns"
        :data-source="productData"
        :loading="loading"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: !isMobile,
          size: isMobile ? 'small' : 'default',
          showTotal: (total: number) => `共 ${total} 条`,
        }"
        row-key="_id"
        :scroll="{ x: isMobile ? 600 : undefined }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'images'">
            <a-image
              v-if="record.images && record.images.length > 0"
              :src="record.images[0]"
              :width="isMobile ? 40 : 60"
              :height="isMobile ? 40 : 60"
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
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="viewSku(record)" class="px-1">
                <template #icon><EyeOutlined /></template>
                <span v-if="!isMobile">SKU</span>
              </a-button>
              <a-button type="link" size="small" @click="openEditSpuModal(record)" class="px-1">
                <template #icon><EditOutlined /></template>
                <span v-if="!isMobile">编辑</span>
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)" class="px-1">
                <template #icon><DeleteOutlined /></template>
                <span v-if="!isMobile">删除</span>
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
      :width="isMobile ? '95%' : '900px'"
      :footer="null"
      centered
    >
      <div class="mb-4">
        <a-button type="primary" size="small" @click="currentSpu && openAddSkuModal(currentSpu)">
          <PlusCircleOutlined /> 添加SKU
        </a-button>
      </div>
      <a-table
        :columns="skuColumns"
        :data-source="skuData"
        :loading="skuLoading"
        :pagination="false"
        row-key="_id"
        size="small"
        :scroll="{ x: isMobile ? 500 : undefined }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'defaultImg'">
            <a-image
              :src="record.defaultImg"
              :width="36"
              :height="36"
              style="object-fit: cover; border-radius: 4px"
            />
          </template>
          <template v-if="column.key === 'price'">
            <span class="text-red-500 text-xs sm:text-sm">¥{{ record.price }}</span>
          </template>
          <template v-if="column.key === 'isSale'">
            <a-tag :color="record.isSale === 1 ? 'green' : 'default'">
              {{ record.isSale === 1 ? '已上架' : '已下架' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="openEditSkuModal(record)" class="px-1">
                <template #icon><EditOutlined /></template>
                <span v-if="!isMobile">编辑</span>
              </a-button>
              <a-button type="link" size="small" danger @click="handleDeleteSku(record)" class="px-1">
                <template #icon><DeleteOutlined /></template>
                <span v-if="!isMobile">删除</span>
              </a-button>
              <a-button type="link" size="small" @click="toggleSku(record)" class="px-1">
                <template #icon><StockOutlined /></template>
                <span v-if="!isMobile">{{ record.isSale === 1 ? '下架' : '上架' }}</span>
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- SPU弹窗 -->
    <a-modal
      v-model:open="showSpuModal"
      :title="isEditingSpu ? '编辑商品' : '添加商品'"
      :width="isMobile ? '95%' : '900px'"
      :footer="null"
      centered
    >
      <div class="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        <a-form 
          :label-col="isMobile ? { span: 24 } : { span: 6 }" 
          :wrapper-col="isMobile ? { span: 24 } : { span: 16 }"
          class="mt-4"
        >
          <a-form-item label="商品名称">
            <a-input v-model:value="spuForm.name" placeholder="请输入商品名称" />
          </a-form-item>

          <a-form-item label="所属店铺">
            <a-select v-model:value="spuForm.shopId" placeholder="请选择店铺">
              <a-select-option value="">请选择店铺</a-select-option>
              <a-select-option v-for="shop in [currentSpu?.shopId || spuForm.shopId]" :key="shop" :value="shop">
                {{ shop }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="三级分类">
            <a-select
              v-model:value="spuForm.categoryId"
              placeholder="请选择三级分类"
              @change="(value) => handleCategoryChange(value, 3)"
            >
              <a-select-option value="">请选择分类</a-select-option>
              <a-select-option
                v-for="cat in categoryList.filter(c => !c.parentId || !c.parentId.startsWith('cat'))"
                :key="cat._id"
                :value="cat._id"
              >
                {{ cat.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="品牌">
            <a-select v-model:value="spuForm.trademarkId" placeholder="请选择品牌">
              <a-select-option value="">请选择品牌</a-select-option>
              <a-select-option v-for="trade in trademarkList" :key="trade._id" :value="trade._id">
                {{ trade.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="商品描述">
            <a-textarea
              v-model:value="spuForm.description"
              :rows="3"
              placeholder="请输入商品描述"
            />
          </a-form-item>

          <a-form-item label="是否显示">
            <a-switch v-model:checked="spuForm.showFlag" :checked-value="1" :un-checked-value="0" />
          </a-form-item>

          <a-form-item label="商品图片">
            <a-upload
              list-type="picture-card"
              :file-list="spuForm.images.map(url => ({ url, uid: url }))"
              :before-upload="handleSpuImageUpload"
              :custom-request="() => {}"
              @change="handleSpuImageChange"
              :max-count="20"
            >
              <div v-if="spuForm.images.length < 20">
                <PlusOutlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
          </a-form-item>

          <a-form-item label="销售属性">
            <div class="space-y-4">
              <div v-for="(attr, attrIndex) in spuSaleAttrList" :key="attr._id" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div class="flex items-center gap-2 mb-3">
                  <a-input v-model:value="attr.name" placeholder="属性名" class="flex-1" />
                  <a-button size="small" danger @click="removeSaleAttr(attrIndex)">删除</a-button>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div v-for="(value, valueIndex) in attr.valueList" :key="value._id" class="flex items-center gap-1 bg-white p-1 rounded border border-slate-100">
                    <a-input v-model:value="value.name" placeholder="值" style="width: 80px" size="small" class="border-none shadow-none focus:ring-0" />
                    <a-button type="text" size="small" danger @click="removeAttrValue(attrIndex, valueIndex)" class="p-0 h-auto">
                      <DeleteOutlined class="text-xs" />
                    </a-button>
                  </div>
                  <a-button size="small" type="dashed" @click="addAttrValue(attrIndex)">+ 属性值</a-button>
                </div>
              </div>
              <a-button type="dashed" block @click="addSaleAttr">
                <PlusOutlined /> 添加销售属性
              </a-button>
            </div>
          </a-form-item>

          <a-form-item :wrapper-col="isMobile ? { span: 24 } : { offset: 6, span: 16 }">
            <div class="flex gap-3">
              <a-button @click="showSpuModal = false" class="flex-1 sm:flex-none">取消</a-button>
              <a-button type="primary" :loading="spuLoading" @click="handleSubmitSpu" class="flex-1 sm:flex-none">
                <SaveOutlined /> 保存
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- SKU管理弹窗 -->
    <a-modal
      v-model:open="showSkuManageModal"
      :title="isEditingSku ? '编辑SKU' : '添加SKU'"
      :width="isMobile ? '95%' : '800px'"
      :footer="null"
      centered
    >
      <div class="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        <a-form 
          :label-col="isMobile ? { span: 24 } : { span: 6 }" 
          :wrapper-col="isMobile ? { span: 24 } : { span: 16 }"
          class="mt-4"
        >
          <a-form-item label="SKU名称">
            <a-input v-model:value="skuForm.name" placeholder="请输入SKU名称" />
          </a-form-item>

          <a-form-item label="价格">
            <a-input-number v-model:value="skuForm.price" :min="0" :precision="2" class="w-full sm:w-48" />
          </a-form-item>

          <a-form-item label="是否上架">
            <a-switch v-model:checked="skuForm.isSale" :checked-value="1" :un-checked-value="0" />
          </a-form-item>

          <a-form-item label="SKU图片">
            <a-upload
              list-type="picture-card"
              :file-list="skuForm.images.map(url => ({ url, uid: url }))"
              :before-upload="handleSkuImageUpload"
              :custom-request="() => {}"
              @change="handleSkuImageChange"
              :max-count="10"
            >
              <div v-if="skuForm.images.length < 10">
                <PlusOutlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
          </a-form-item>

          <a-form-item label="属性值">
            <div class="space-y-3">
              <div v-for="(attr, index) in skuForm.skuSaleAttrValueList" :key="index" class="flex items-center gap-2 p-2 bg-slate-50 rounded">
                <span class="text-slate-500 text-sm w-20 truncate">{{ attr.attrId }}:</span>
                <a-input v-model:value="attr.valueName" placeholder="属性值名称" class="flex-1" />
              </div>
            </div>
          </a-form-item>

          <a-form-item :wrapper-col="isMobile ? { span: 24 } : { offset: 6, span: 16 }">
            <div class="flex gap-3">
              <a-button @click="showSkuManageModal = false" class="flex-1 sm:flex-none">取消</a-button>
              <a-button type="primary" :loading="skuLoading" @click="handleSubmitSku" class="flex-1 sm:flex-none">
                <SaveOutlined /> 保存
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>
