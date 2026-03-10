<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	PlusOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, onMounted, ref, reactive, createVNode } from "vue";
import {
	createCategory,
	deleteCategory,
	getAllCategoryList,
	updateCategory,
	updateCategoryShowFlag,
} from "@/api";
import type { Category } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const categoryData = ref<Category[]>([]);
const showModal = ref(false);
const editingCategory = ref<Category | null>(null);
const formState = reactive({
	name: "",
	parentId: "",
	sort: 0,
});

const selectedRowKeys = ref<string[]>([]);

// 选择框配置：符合树形逻辑的联动选择
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
	checkStrictly: false, // 启用联动勾选 (选父自动勾子)
}));

const columns = computed(() => {
	const allColumns = [
		{ title: "分类名称", dataIndex: "name", key: "name", minWidth: 150 },
		{ title: "排序", dataIndex: "sort", key: "sort", width: 80 },
		{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 80 },
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 180,
		},
		{
			title: "操作",
			key: "action",
			width: isMobile.value ? 100 : 200,
			fixed: isMobile.value ? undefined : "right",
		},
	];

	if (isMobile.value) {
		return allColumns.filter(
			(col) => !["sort", "createTime"].includes(col.key as string),
		);
	}
	return allColumns;
});

// 获取分类列表
const fetchCategories = async () => {
	loading.value = true;
	try {
		const res = await getAllCategoryList();
		const data = res as any;
		const list = data.categoryList || (data.data && data.data.categoryList) || [];
		
		if (list) {
			const cleanData = (list: Category[], path = "0"): any[] => {
				return list.map((item, index) => {
					const id = item._id || (item as any).id;
					const uniqueKey = id || `${path}-${index}`;
					const newItem = { ...item, key: uniqueKey, actualId: id };
					if (newItem.children && newItem.children.length > 0) {
						newItem.children = cleanData(newItem.children, uniqueKey);
					} else {
						delete newItem.children;
					}
					return newItem;
				});
			};
			categoryData.value = cleanData(list);
		}
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取分类列表失败:", error);
		message.error("获取分类列表失败");
	} finally {
		loading.value = false;
	}
};

// 打开新增/编辑弹窗
const openModal = (category?: Category) => {
	if (category) {
		editingCategory.value = category;
		formState.name = category.name;
		formState.parentId = (category as any).parentId || "";
		formState.sort = category.sort || 0;
	} else {
		editingCategory.value = null;
		formState.name = "";
		formState.parentId = "";
		formState.sort = 0;
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入分类名称");

	try {
		if (editingCategory.value) {
			const id = (editingCategory.value as any).actualId || editingCategory.value._id || (editingCategory.value as any).id;
			await updateCategory({
				id,
				name: formState.name,
				sort: formState.sort,
			});
			message.success("修改成功");
		} else {
			await createCategory({
				name: formState.name,
				parentId: formState.parentId || undefined,
				sort: formState.sort,
			});
			message.success("添加成功");
		}
		showModal.value = false;
		fetchCategories();
	} catch (error: any) {
		console.error("提交分类失败:", error);
		message.error(error.message || "操作失败");
	}
};

// 切换显示状态
const toggleShowFlag = async (category: any) => {
	const id = category.actualId || category._id || category.id;
	if (!id) return message.error("无效的分类ID");
	const newFlag = category.showFlag === 1 ? 0 : 1;
	try {
		await updateCategoryShowFlag(id, newFlag);
		message.success(newFlag === 1 ? "已显示" : "已隐藏");
		fetchCategories();
	} catch (error: any) {
		message.error(error.message || "操作失败");
	}
};

/**
 * 递归收集节点深度，用于拓扑排序删除
 */
const getNodeDepth = (id: string, list: any[]): number => {
	for (const item of list) {
		if (item.actualId === id || item.key === id) return 1;
		if (item.children) {
			const childDepth = getNodeDepth(id, item.children);
			if (childDepth > 0) return childDepth + 1;
		}
	}
	return 0;
};

/**
 * 优化后的批量删除逻辑 (符合树形结构的拓扑删除顺序)
 */
const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在同步清理分类树...`, 0);
	
	// 1. 核心逻辑：按深度降序排列 (先删除最深层的子分类，最后删除父分类)
	// 这样可以规避后端因“分类下有子类不允许删除”的约束错误
	const sortedIds = [...ids].sort((a, b) => {
		return getNodeDepth(b, categoryData.value) - getNodeDepth(a, categoryData.value);
	});

	let successCount = 0;
	let failCount = 0;

	// 2. 依次删除 (对于树结构，严格顺序比并发更重要)
	for (const id of sortedIds) {
		try {
			await deleteCategory(id);
			successCount++;
		} catch (e) {
			failCount++;
		}
	}

	hide();
	if (successCount > 0) message.success(`成功清理 ${successCount} 个分类节点`);
	if (failCount > 0) message.error(`${failCount} 个分类删除受阻 (可能包含关联商品)`);
	
	fetchCategories();
};

// 删除单条
const handleDelete = (category: any) => {
	const id = category.actualId || category._id || category.id;
	if (!id) return message.error("无效的分类ID");
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除分类"${category.name}"吗？这将连带其所有子分类一起清理。`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete([id]), // 即使删单条也走深度清理逻辑
	});
};

// 批量删除
const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "批量清理确认",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个分类节点吗？系统将按层级自动执行深度清理。`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchCategories();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">分类管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加分类
      </a-button>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <!-- 批量操作工具栏 -->
      <div v-if="selectedRowKeys.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
        <span class="text-blue-600 text-sm font-medium">已选择 {{ selectedRowKeys.length }} 项 (包含子分类联动)</span>
        <a-space>
          <a-button size="small" type="link" @click="selectedRowKeys = []">取消选择</a-button>
          <a-button size="small" type="primary" danger @click="handleBatchDelete">
            <DeleteOutlined /> 批量删除
          </a-button>
        </a-space>
      </div>

      <a-table
        :columns="columns"
        :data-source="categoryData"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="false"
        row-key="key"
        :default-expand-all-rows="false"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'showFlag'">
            <a-tag :color="record.showFlag === 1 ? 'green' : 'default'">
              {{ record.showFlag === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="toggleShowFlag(record)" class="px-1">
                <template #icon>
                  <component :is="record.showFlag === 0 ? EyeOutlined : EyeInvisibleOutlined" />
                </template>
                <span v-if="!isMobile">{{ record.showFlag === 1 ? '隐藏' : '显示' }}</span>
              </a-button>
              <a-button type="link" size="small" @click="openModal(record)" class="px-1">
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

    <a-modal
      v-model:open="showModal"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form layout="vertical">
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
