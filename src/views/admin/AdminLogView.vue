<script setup lang="ts">
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import { deleteAdminLog, getAdminLogList } from "@/api";
import type { AdminLog } from "@/api/types";
import { formatDate } from "@/lib/utils";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const logData = ref<AdminLog[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchAdminName = ref("");
const selectedRowKeys = ref<string[]>([]);

// 选择框配置
const rowSelection = computed(() => ({
	selectedRowKeys: selectedRowKeys.value,
	onChange: (keys: any[]) => {
		selectedRowKeys.value = keys;
	},
}));

const columns = ref([
	{ title: "ID", dataIndex: "_id", key: "_id", width: 220, resizable: true },
	{ title: "操作人", dataIndex: "adminName", key: "adminName", width: 120, resizable: true },
	{ title: "操作内容", dataIndex: "describe", key: "describe", width: 250, resizable: true },
	{ title: "操作时间", dataIndex: "created_at", key: "created_at", width: 180, resizable: true },
	{
		title: "操作",
		key: "action",
		width: isMobile.value ? 80 : 120,
		resizable: true,
	},
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		// 移动端隐藏 ID 和 操作时间
		return columns.value.filter((col) => !["_id", "created_at"].includes(col.key as string));
	}
	return columns.value;
});

const handleResizeColumn = (w: number, col: any) => {
	col.width = w;
};

// 获取日志列表
const fetchLogs = async () => {
	loading.value = true;
	try {
		const res = await getAdminLogList({
			adminName: searchAdminName.value || undefined,
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		const data = res as any;
		const list = data.attrList || (data.data && data.data.attrList) || [];

		logData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));

		pagination.total = data.count || (data.data && data.data.count) || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取日志列表失败:", error);
		message.error("获取日志列表失败");
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pagination.current = 1;
	fetchLogs();
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchLogs();
};

/**
 * 统一执行批量删除逻辑
 */
const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在执行批量删除...`, 0);
	let successCount = 0;
	let failCount = 0;

	const deletePromises = ids.map(async (id) => {
		try {
			await deleteAdminLog(id);
			successCount++;
		} catch (e) {
			failCount++;
		}
	});

	await Promise.all(deletePromises);
	hide();

	if (successCount > 0) {
		message.success(`批量操作完成：成功删除 ${successCount} 条`);
	}
	if (failCount > 0) {
		message.error(`${failCount} 条日志删除失败`);
	}

	fetchLogs();
};

// 删除单条日志
const handleDelete = (record: any) => {
	const id = record._id || record.id;
	if (!id) return message.error("无效的日志ID");

	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: "确定要删除这条日志吗？",
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteAdminLog(id);
				message.success("删除成功");
				fetchLogs();
			} catch (error: any) {
				message.error(`删除失败: ${error.message}`);
			}
		},
	});
};

// 批量删除选中的项
const handleBatchDelete = () => {
	if (selectedRowKeys.value.length === 0) return;

	Modal.confirm({
		title: "批量删除确认",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 条日志吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchLogs();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">操作日志</h1>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div class="flex flex-wrap items-center gap-4">
        <a-input
          v-model:value="searchAdminName"
          placeholder="请输入操作人"
          :style="{ width: isMobile ? '100%' : '200px' }"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" :block="isMobile" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <!-- 批量操作工具栏 -->
      <div v-if="selectedRowKeys.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
        <span class="text-blue-600 text-sm font-medium">
          已选择 {{ selectedRowKeys.length }} 项日志
        </span>
        <a-space>
          <a-button size="small" type="link" @click="selectedRowKeys = []">取消选择</a-button>
          <a-button size="small" type="primary" danger @click="handleBatchDelete">
            <DeleteOutlined /> 批量删除
          </a-button>
        </a-space>
      </div>

      <a-table
        :columns="displayedColumns"
        :data-source="logData"
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
        @resizeColumn="handleResizeColumn"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
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
