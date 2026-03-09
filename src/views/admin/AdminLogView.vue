<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  getAdminLogList,
  deleteAdminLog,
} from '@/api/admin';
import type { AdminLog } from '@/api/admin';
import { DeleteOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const logData = ref<AdminLog[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const searchAdminName = ref('');

const columns = [
  { title: 'ID', dataIndex: '_id', key: '_id', width: 220 },
  { title: '操作人', dataIndex: 'adminName', key: 'adminName', width: 120 },
  { title: '操作内容', dataIndex: 'operation', key: 'operation' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: '操作时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100 },
];

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getAdminLogList({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    if (res.code === 200 && res.attrList) {
      logData.value = res.attrList;
      pagination.total = res.count || res.attrList.length;
    }
  } catch {
    message.error('获取日志列表失败');
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
    title: '确认删除',
    content: '确定要删除此日志吗？',
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await deleteAdminLog(log._id);
        message.success('删除成功');
        fetchLogs();
      } catch {
        message.error('删除失败');
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
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">操作日志</h1>
    </div>

    <!-- 搜索栏 -->
    <a-card>
      <div class="flex items-center gap-4">
        <a-input
          v-model:value="searchAdminName"
          placeholder="请输入操作人"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <!-- 日志表格 -->
    <a-card>
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
        }"
        row-key="_id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" danger @click="handleDelete(record)">
              <DeleteOutlined />
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
