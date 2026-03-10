<script setup lang="ts">
import { DeleteOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { deleteAdminLog, getAdminLogList } from "@/api";
import type { AdminLog } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller('md').value);

const loading = ref(false);
const logData = ref<AdminLog[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchAdminName = ref("");

const columns = computed(() => {
	const allColumns = [
		{ title: "ID", dataIndex: "_id", key: "_id", width: 220 },
		{ title: "操作人", dataIndex: "adminName", key: "adminName", width: 120 },
		{ title: "操作内容", dataIndex: "describe", key: "describe", minWidth: 200 },
		{ title: "IP地址", dataIndex: "ip", key: "ip", width: 140 },
		{ title: "操作时间", dataIndex: "created_at", key: "created_at", width: 180 },
		{ title: "操作", key: "action", width: isMobile.value ? 80 : 120, fixed: isMobile.value ? undefined : 'right' },
	];

	if (isMobile.value) {
		// 移动端隐藏 ID, IP, 操作时间
		return allColumns.filter(col => !['_id', 'ip', 'created_at'].includes(col.key as string));
	}
	return allColumns;
});

// 获取日志列表
const fetchLogs = async () => {
	loading.value = true;
	try {
		const res = await getAdminLogList({
			adminName: searchAdminName.value,
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		if (res.code === 200 && res.attrList) {
			logData.value = res.attrList;
			pagination.total = res.count || res.attrList.length;
		}
	} catch {
		message.error("获取日志列表失败");
	} finally {
		loading.value = false;
	}
};

// 搜索
const handleSearch = () => {
	pagination.current = 1;
	fetchLogs();
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchLogs();
};

// 删除日志
const handleDelete = (log: AdminLog) => {
	Modal.confirm({
		title: "确认删除",
		content: "确定要删除此日志吗？",
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteAdminLog(log._id);
				message.success("删除成功");
				fetchLogs();
			} catch {
				message.error("删除失败");
			}
		},
	});
};

onMounted(() => {
	fetchLogs();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">操作日志</h1>
    </div>

    <!-- 搜索栏 -->
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

    <!-- 日志表格 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <a-table
        :columns="columns"
        :data-source="logData"
        :loading="loading"
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
