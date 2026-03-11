<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
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
const parentCategoryName = ref(""); // 用于在弹窗中显示父级名称

const formState = reactive({
	name: "",
	parentId: undefined as string | undefined,
	sort: 0,
});

const selectedRowKeys = ref<string[]>([]);

// 选择框配置
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
	checkStrictly: false,
}));

// 表格列定义
const columns = ref([
	{ title: "分类名称", dataIndex: "name", key: "name", width: 250, resizable: true },
	{ title: "排序", dataIndex: "sort", key: "sort", width: 80, resizable: true },
	{ title: "状态", dataIndex: "showFlag", key: "showFlag", width: 80, resizable: true },
	{
		title: "创建时间",
		dataIndex: "createTime",
		key: "createTime",
		width: 180,
		resizable: true,
	},
	{
		title: "操作",
		key: "action",
		width: isMobile.value ? 120 : 260,
		resizable: true,
	},
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		return columns.value.filter((col) => !["sort", "createTime"].includes(col.key as string));
	}
	return columns.value;
});

const handleResizeColumn = (w: number, col: any) => {
	col.width = w;
};

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

// 打开新增/编辑弹窗 (优化引导逻辑)
const openModal = (category?: Category, parent?: Category) => {
	if (category) {
		// 编辑模式
		editingCategory.value = category;
		formState.name = category.name;
		formState.parentId = (category as any).parentId || undefined;
		formState.sort = category.sort || 0;
		parentCategoryName.value = ""; 
	} else if (parent) {
		// 添加子分类模式
		editingCategory.value = null;
		formState.name = "";
		formState.parentId = parent.actualId || parent._id;
		formState.sort = 0;
		parentCategoryName.value = parent.name;
	} else {
		// 添加一级分类模式
		editingCategory.value = null;
		formState.name = "";
		formState.parentId = undefined;
		formState.sort = 0;
		parentCategoryName.value = "无 (一级分类)";
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入分类名称");

	try {
		if (editingCategory.value) {
			const id =
				(editingCategory.value as any).actualId ||
				editingCategory.value._id ||
				(editingCategory.value as any).id;
			await updateCategory({
				id,
				name: formState.name,
				parentId: formState.parentId || "",
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
 * 递归收集节点深度
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
 * 递归收集所有子分类的 actualId
 */
const getAllChildIds = (category: any): string[] => {
	let ids: string[] = [];
	if (category.children && category.children.length > 0) {
		for (const child of category.children) {
			const id = child.actualId || child._id || child.id;
			if (id) ids.push(id);
			ids = ids.concat(getAllChildIds(child));
		}
	}
	return ids;
};

/**
 * 批量删除逻辑 (优化拓扑清理)
 */
const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在同步清理分类树...`, 0);
	
	// 1. 根据当前 ID 列表，获取它们在 categoryData 中的深度，用于排序
	// 我们希望先删除深层节点
	const sortedIds = [...ids].sort((a, b) => {
		return getNodeDepth(b, categoryData.value) - getNodeDepth(a, categoryData.value);
	});

	let successCount = 0;
	let failCount = 0;

	// 2. 串行删除，确保顺序
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
	if (failCount > 0) message.error(`${failCount} 个节点删除失败 (可能存在关联商品)`);
	fetchCategories();
};

const handleDelete = (record: any) => {
	const id = record.actualId || record._id || record.id;
	if (!id) return message.error("无效的分类ID");

	// 收集该分类下所有的子分类 ID
	const childIds = getAllChildIds(record);
	const allIdsToDelete = [id, ...childIds];

	Modal.confirm({
		title: "确认清理分类",
		icon: createVNode(ExclamationCircleOutlined),
		content: childIds.length > 0 
			? `分类 "${record.name}" 下包含 ${childIds.length} 个子分类，系统将按层级自动执行深度清理。确认继续吗？`
			: `确定要删除分类 "${record.name}" 吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(allIdsToDelete),
	});
};

const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;
	Modal.confirm({
		title: "批量清理确认",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个分类节点吗？`,
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
        添加一级分类
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
        :columns="displayedColumns"
        :data-source="categoryData"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="false"
        row-key="key"
        @resizeColumn="handleResizeColumn"
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
              <a-button 
                v-if="record.level < 3"
                type="link" 
                size="small" 
                @click="openModal(undefined, record)" 
                class="px-1 text-emerald-600"
              >
                <template #icon><PlusCircleOutlined /></template>
                <span v-if="!isMobile">添加子类</span>
              </a-button>
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
      :title="editingCategory ? '编辑分类' : (formState.parentId ? '添加子分类' : '添加一级分类')"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '500px'"
      destroyOnClose
    >
      <a-form layout="vertical">
        <a-form-item v-if="parentCategoryName" label="父级分类">
          <a-input :value="parentCategoryName" disabled class="bg-slate-50" />
        </a-form-item>
        <a-form-item label="分类名称" required>
          <a-input v-model:value="formState.name" :placeholder="formState.parentId ? '请输入子分类名称' : '请输入一级分类名称'" />
        </a-form-item>
        <a-form-item label="排序权重">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" placeholder="数字越大越靠前" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
