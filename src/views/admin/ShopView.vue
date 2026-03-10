<script setup lang="ts">
import {
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	StopOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { deleteShop, getShopList, updateShop } from "@/api";
import type { Shop } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller('md').value);

const loading = ref(false);
const shopData = ref<Shop[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchName = ref("");

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
		{ title: "店主", dataIndex: "ownerName", key: "ownerName", width: 120 },
		{ title: "状态", dataIndex: "status", key: "status", width: 100 },
		{ title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
		{ title: "操作", key: "action", width: isMobile.value ? 100 : 180, fixed: isMobile.value ? undefined : 'right' },
	];

	if (isMobile.value) {
		// 移动端隐藏 ID, 描述, 店主, 创建时间
		return allColumns.filter(col => !['_id', 'description', 'ownerName', 'createTime'].includes(col.key as string));
	}
	return allColumns;
});

/**
 * 获取店铺列表
 * 从后端API获取所有店铺数据，并更新本地状态
 */
const fetchShops = async () => {
	loading.value = true;
	try {
		const res = await getShopList();
		if (res.code === 200 && res.shopList) {
			shopData.value = res.shopList;
			pagination.total = res.shopList.length;
		}
	} catch {
		message.error("获取店铺列表失败");
	} finally {
		loading.value = false;
	}
};

/**
 * 搜索店铺
 * 重置分页并重新获取店铺列表
 */
const handleSearch = () => {
	pagination.current = 1;
	fetchShops();
};

/**
 * 分页变化处理
 * @param pag - 分页参数，包含当前页码和每页条数
 */
const handleTableChange = (pag: { current: number; pageSize: number }) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchShops();
};

/**
 * 切换店铺状态
 * @param shop - 店铺对象
 */
const toggleStatus = async (shop: Shop) => {
	const newStatus = shop.status === 1 ? 0 : 1;
	try {
		await updateShop(shop._id, { status: newStatus });
		message.success(newStatus === 1 ? "已启用" : "已禁用");
		fetchShops();
	} catch {
		message.error("操作失败");
	}
};

/**
 * 删除店铺
 * 弹出确认对话框，确认后删除指定店铺
 * @param shop - 店铺对象
 */
const handleDelete = (shop: Shop) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除店铺"${shop.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteShop(shop._id);
				message.success("删除成功");
				fetchShops();
			} catch {
				message.error("删除失败");
			}
		},
	});
};

onMounted(() => {
	fetchShops();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">店铺管理</h1>
    </div>

    <!-- 搜索栏 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div class="flex flex-wrap items-center gap-4">
        <a-input
          v-model:value="searchName"
          placeholder="请输入店铺名称"
          :style="{ width: isMobile ? '100%' : '200px' }"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" :block="isMobile" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <!-- 店铺列表表格 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <a-table
        :columns="columns"
        :data-source="shopData"
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
          <!-- 店铺Logo -->
          <template v-if="column.key === 'logo'">
            <a-image
              :src="record.logo"
              :width="isMobile ? 48 : 60"
              :height="isMobile ? 48 : 60"
              style="object-fit: contain; border-radius: 4px"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>

          <!-- 店铺状态 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'default'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>

          <!-- 操作按钮 -->
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="toggleStatus(record)" class="px-1">
                <template #icon>
                  <component :is="record.status === 0 ? CheckCircleOutlined : StopOutlined" />
                </template>
                <span v-if="!isMobile">{{ record.status === 1 ? '禁用' : '启用' }}</span>
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
