<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	ClearOutlined,
	SearchOutlined,
	ReloadOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import {
	createTrademark,
	deleteTrademark,
	getTrademarkList,
	updateTrademark,
} from "@/api";
import { getFileUrl } from "@/api/request";
import type { Trademark } from "@/api/types";
import FileUpload from "@/components/FileUpload.vue";
import { formatDate } from "@/lib/utils";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const brandData = ref<Trademark[]>([]);
const searchName = ref("");
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
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

const columns = computed(() => [
	{ title: "品牌Logo", dataIndex: "logo", key: "logo", width: 100, align: "center" },
	{ title: "品牌名称", dataIndex: "name", key: "name", minWidth: 150 },
	{ title: "排序权重", dataIndex: "sort", key: "sort", width: 100, align: "center" },
	{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 100, align: "center" },
	{ title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
	{ title: "操作", key: "action", width: 160 },
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		return columns.value.filter((col) => ["logo", "name", "action"].includes(col.key as string));
	}
	return columns.value;
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
		const list = data.trademarkList || (data.data && data.data.trademarkList) || data.list || [];
		brandData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));
		pagination.total = data.count || data.total || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		message.error("获取品牌列表失败");
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pagination.current = 1;
	fetchBrands();
};

const handleReset = () => {
	searchName.value = "";
	pagination.current = 1;
	fetchBrands();
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchBrands();
};

const openModal = (brand?: Trademark) => {
	if (brand) {
		editingBrand.value = brand;
		Object.assign(formState, {
			name: brand.name,
			logo: brand.logo || "",
			sort: brand.sort || 0,
		});
	} else {
		editingBrand.value = null;
		Object.assign(formState, {
			name: "",
			logo: "",
			sort: 0,
		});
	}
	showModal.value = true;
};

const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入品牌名称");
	loading.value = true;
	try {
		if (editingBrand.value) {
			const id = editingBrand.value._id || (editingBrand.value as any).id;
			await updateTrademark({
				id,
				...formState,
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
		message.error(error.message || "提交失败");
	} finally {
		loading.value = false;
	}
};

const handleDelete = (brand: Trademark) => {
	const id = brand._id || (brand as any).id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除品牌 "${brand.name}" 吗？`,
		onOk: async () => {
			try {
				await deleteTrademark(id);
				message.success("删除成功");
				fetchBrands();
			} catch (error: any) {
				message.error("删除失败");
			}
		},
	});
};

const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "确认批量删除",
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个品牌吗？`,
		onOk: async () => {
			const hide = message.loading("正在删除...", 0);
			try {
				await Promise.all(selectedRowKeys.value.map((id) => deleteTrademark(id)));
				message.success("批量删除成功");
				fetchBrands();
			} catch {
				message.error("部分删除失败");
			} finally {
				hide();
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
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">品牌管理</h1>
      <div class="flex gap-2">
        <a-input
          v-model:value="searchName"
          placeholder="搜索品牌名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="openModal()">
          <PlusOutlined /> 添加品牌
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
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logo'">
            <a-image
              :src="getFileUrl(record.logo)"
              :width="60"
              :height="40"
              style="object-fit: contain; border-radius: 4px; background: #f8fafc"
            />
          </template>
          <template v-if="column.key === 'showFlag'">
            <a-tag :color="record.showFlag === 1 ? 'green' : 'default'">
              {{ record.showFlag === 1 ? '显示中' : '已隐藏' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'createTime'">
            <span class="text-slate-500 text-xs">{{ formatDate(record.createTime) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openModal(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
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
        <a-form-item label="品牌Logo" required>
          <FileUpload v-model:value="formState.logo" />
        </a-form-item>
        <a-form-item label="品牌名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入品牌名称" />
        </a-form-item>
        <a-form-item label="排序权重">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
