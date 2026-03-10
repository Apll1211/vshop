<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import {
	batchDeleteTrademark,
	createTrademark,
	deleteTrademark,
	getTrademarkList,
	updateTrademark,
} from "@/api";
import { getFileUrl } from "@/api/request";
import type { Trademark } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const brandData = ref<Trademark[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchName = ref("");
const showModal = ref(false);
const editingBrand = ref<Trademark | null>(null);
const formState = reactive({
	name: "",
	logo: "",
	sort: 0,
});

const selectedRowKeys = ref<string[]>([]);

// 选择框配置
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
}));

const columns = computed(() => {
	const allColumns = [
		{ title: "ID", dataIndex: "_id", key: "_id", width: 220 },
		{ title: "Logo", dataIndex: "logo", key: "logo", width: 100 },
		{ title: "品牌名称", dataIndex: "name", key: "name", minWidth: 120 },
		{ title: "排序", dataIndex: "sort", key: "sort", width: 80 },
		{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 100 },
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 180,
		},
		{
			title: "操作",
			key: "action",
			width: isMobile.value ? 100 : 180,
			fixed: isMobile.value ? undefined : "right",
		},
	];

	if (isMobile.value) {
		return allColumns.filter((col) => !["_id", "sort", "createTime"].includes(col.key as string));
	}
	return allColumns;
});

// 获取品牌列表
const fetchBrands = async () => {
	loading.value = true;
	try {
		const res = await getTrademarkList({
			keyword: searchName.value || undefined,
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		const data = res as any;
		const list = data.trademarkList || (data.data && data.data.trademarkList) || [];
		brandData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));
		pagination.total = data.count || data.total || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取品牌列表失败:", error);
		message.error("获取品牌列表失败");
	} finally {
		loading.value = false;
	}
};

// 打开新增/编辑弹窗
const openModal = (brand?: Trademark) => {
	if (brand) {
		editingBrand.value = brand;
		formState.name = brand.name;
		formState.logo = brand.logo || "";
		formState.sort = brand.sort;
	} else {
		editingBrand.value = null;
		formState.name = "";
		formState.logo = "";
		formState.sort = 0;
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入品牌名称");
	// 移除对 Logo 地址的非空校验

	try {
		if (editingBrand.value) {
			const id = editingBrand.value._id || (editingBrand.value as any).id;
			await updateTrademark({
				id,
				name: formState.name,
				logo: formState.logo,
				sort: formState.sort,
			} as any);
			message.success("修改成功");
		} else {
			const formData = new FormData();
			formData.append("name", formState.name);
			formData.append("logo", formState.logo);
			formData.append("sort", String(formState.sort));
			await createTrademark(formData);
			message.success("添加成功");
		}
		showModal.value = false;
		fetchBrands();
	} catch (error: any) {
		console.error("提交品牌失败:", error);
		message.error(error.message || "操作失败");
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
			await deleteTrademark(id);
			successCount++;
		} catch (e) {}
	}
	hide();
	message.success(`成功删除 ${successCount} 项`);
	fetchBrands();
};

// 删除单条
const handleDelete = (brand: Trademark) => {
	const id = brand._id || (brand as any).id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除品牌"${brand.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteTrademark(id);
				message.success("删除成功");
				fetchBrands();
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
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个品牌吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchBrands();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">品牌管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加品牌
      </a-button>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div class="flex flex-wrap items-center gap-4">
        <a-input
          v-model:value="searchName"
          placeholder="请输入品牌名称"
          :style="{ width: isMobile ? '100%' : '200px' }"
          allow-clear
          @pressEnter="() => { pagination.current = 1; fetchBrands(); }"
        />
        <a-button type="primary" :block="isMobile" @click="() => { pagination.current = 1; fetchBrands(); }">搜索</a-button>
      </div>
    </a-card>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
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
        :data-source="brandData"
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
        @change="(pag: any) => { pagination.current = pag.current; pagination.pageSize = pag.pageSize; fetchBrands(); }"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logo'">
            <a-image
              :src="getFileUrl(record.logo)"
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
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="openModal(record)" class="px-1">
                <template #icon><EditOutlined /></template>
                <span v-if="!isMobile">编辑</span>
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
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
      :title="editingBrand ? '编辑品牌' : '添加品牌'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form layout="vertical">
        <a-form-item label="品牌名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入品牌名称" />
        </a-form-item>
        <a-form-item label="Logo地址">
          <a-input v-model:value="formState.logo" placeholder="请输入Logo图片地址" />
          <div v-if="formState.logo" class="mt-2">
            <a-image :src="getFileUrl(formState.logo)" :width="100" />
          </div>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
