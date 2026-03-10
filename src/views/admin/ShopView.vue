<script setup lang="ts">
import {
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	StopOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import { deleteShop, getShopList, saveShop } from "@/api";
import { getFileUrl } from "@/api/request";
import type { Shop } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const shopData = ref<Shop[]>([]);
const searchName = ref("");

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
		{ title: "店铺名称", dataIndex: "name", key: "name", minWidth: 150 },
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			ellipsis: true,
		},
		{ title: "状态", dataIndex: "status", key: "status", width: 100 },
		{
			title: "操作",
			key: "action",
			width: isMobile.value ? 120 : 200,
			fixed: isMobile.value ? undefined : "right",
		},
	];

	if (isMobile.value) {
		return allColumns.filter((col) => !["_id", "description"].includes(col.key as string));
	}
	return allColumns;
});

// 获取店铺列表
const fetchShops = async () => {
	loading.value = true;
	try {
		const res = await getShopList();
		const data = res as any;
		const list = data.shopList || data.data?.shopList || (Array.isArray(data) ? data : []);
		shopData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取店铺列表失败:", error);
		message.error("获取店铺列表失败");
	} finally {
		loading.value = false;
	}
};

// 切换状态
const toggleStatus = async (shop: Shop) => {
	const newStatus = shop.status === 1 ? 0 : 1;
	const id = shop._id || shop.id;
	try {
		await saveShop({
			id,
			status: newStatus,
		});
		message.success(newStatus === 1 ? "已开启" : "已关闭");
		fetchShops();
	} catch (error: any) {
		console.error("更新店铺状态失败:", error);
		message.error(error.message || "更新失败");
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
			await deleteShop(id);
			successCount++;
		} catch (e) {}
	}
	hide();
	message.success(`成功删除 ${successCount} 个店铺`);
	fetchShops();
};

// 删除单条
const handleDelete = (shop: Shop) => {
	const id = shop._id || shop.id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除店铺"${shop.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteShop(id);
				message.success("删除成功");
				fetchShops();
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
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 个店铺吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchShops();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">店铺管理</h1>
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
        :data-source="shopData"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="false"
        row-key="_id"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 店铺Logo -->
          <template v-if="column.key === 'logo'">
            <a-image
              :src="getFileUrl(record.logo)"
              :width="isMobile ? 48 : 60"
              :height="isMobile ? 48 : 60"
              style="object-fit: contain; border-radius: 4px"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>

          <!-- 状态展示 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '营业中' : '歇业中' }}
            </a-tag>
          </template>

          <!-- 操作栏 -->
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="toggleStatus(record)" class="px-1">
                <template #icon>
                  <component :is="record.status === 0 ? CheckCircleOutlined : StopOutlined" />
                </template>
                <span v-if="!isMobile">{{ record.status === 1 ? '歇业' : '开业' }}</span>
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
  </div>
</template>
