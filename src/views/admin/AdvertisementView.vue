<script setup lang="ts">
import {
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	StopOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import { onMounted, reactive, ref, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import {
	createAdv,
	deleteAdv,
	getAdvList,
	updateAdv,
	updateAdvStatus,
} from "@/api";
import type { Advertisement } from "@/api/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller('md').value);

const loading = ref(false);
const advData = ref<Advertisement[]>([]);
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const searchTitle = ref("");
const showModal = ref(false);
const editingAdv = ref<Advertisement | null>(null);
const formState = ref({
	name: "",
	imgUrl: "",
	linkUrl: "",
	advType: 1,
	sort: 0,
});

const columns = computed(() => {
	const allColumns = [
		{ title: "ID", dataIndex: "_id", key: "_id", width: 220 },
		{ title: "广告图片", dataIndex: "imgUrl", key: "imgUrl", width: 120 },
		{ title: "标题", dataIndex: "name", key: "name", minWidth: 150 },
		{ title: "链接", dataIndex: "linkUrl", key: "linkUrl", ellipsis: true },
		{ title: "类型", dataIndex: "advType", key: "advType", width: 100 },
		{ title: "排序", dataIndex: "sort", key: "sort", width: 80 },
		{ title: "状态", dataIndex: "status", key: "status", width: 100 },
		{ title: "操作", key: "action", width: isMobile.value ? 110 : 200, fixed: isMobile.value ? undefined : 'right' },
	];

	if (isMobile.value) {
		// 移动端隐藏 ID, 链接, 类型, 排序
		return allColumns.filter(col => !['_id', 'linkUrl', 'advType', 'sort'].includes(col.key as string));
	}
	return allColumns;
});

// 获取广告列表
const fetchAdvList = async () => {
	loading.value = true;
	try {
		const res = await getAdvList({
			keyword: searchTitle.value || undefined,
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
		});
		if (res.code === 200 && res.data) {
			advData.value = res.data;
			pagination.total = res.total || res.data.length;
		}
	} catch {
		message.error("获取广告列表失败");
	} finally {
		loading.value = false;
	}
};

// 搜索
const handleSearch = () => {
	pagination.current = 1;
	fetchAdvList();
};

// 分页改变
const handleTableChange = (pag: { current: number; pageSize: number }) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchAdvList();
};

// 打开新增/编辑弹窗
const openModal = (adv?: Advertisement) => {
	if (adv) {
		editingAdv.value = adv;
		formState.value = {
			name: adv.name,
			imgUrl: adv.imgUrl,
			linkUrl: adv.linkUrl || "",
			advType: adv.advType,
			sort: adv.sort,
		};
	} else {
		editingAdv.value = null;
		formState.value = {
			name: "",
			imgUrl: "",
			linkUrl: "",
			advType: 1,
			sort: 0,
		};
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!formState.value.name) {
		message.warning("请输入广告标题");
		return;
	}
	if (!formState.value.imgUrl) {
		message.warning("请输入图片地址");
		return;
	}

	try {
		if (editingAdv.value) {
			await updateAdv({
				id: editingAdv.value._id,
				name: formState.value.name,
				imgUrl: formState.value.imgUrl,
				linkUrl: formState.value.linkUrl,
				advType: formState.value.advType,
				sort: formState.value.sort,
			});
			message.success("修改成功");
		} else {
			await createAdv(formState.value);
			message.success("添加成功");
		}
		showModal.value = false;
		fetchAdvList();
	} catch {
		message.error("操作失败");
	}
};

// 切换状态
const toggleStatus = async (adv: Advertisement) => {
	const newStatus = adv.status === 1 ? 0 : 1;
	try {
		await updateAdvStatus(adv._id, newStatus);
		message.success(newStatus === 1 ? "已启用" : "已禁用");
		fetchAdvList();
	} catch {
		message.error("操作失败");
	}
};

// 删除广告
const handleDelete = (adv: Advertisement) => {
	Modal.confirm({
		title: "确认删除",
		content: `确定要删除广告"${adv.name}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteAdv(adv._id);
				message.success("删除成功");
				fetchAdvList();
			} catch {
				message.error("删除失败");
			}
		},
	});
};

onMounted(() => {
	fetchAdvList();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">广告管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined />
        添加广告
      </a-button>
    </div>

    <!-- 搜索栏 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div class="flex flex-wrap items-center gap-4">
        <a-input
          v-model:value="searchTitle"
          placeholder="请输入广告标题"
          :style="{ width: isMobile ? '100%' : '200px' }"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" :block="isMobile" @click="handleSearch">搜索</a-button>
      </div>
    </a-card>

    <!-- 广告表格 -->
    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <a-table
        :columns="columns"
        :data-source="advData"
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
          <template v-if="column.key === 'imgUrl'">
            <a-image
              :src="record.imgUrl"
              :width="isMobile ? 80 : 100"
              :height="isMobile ? 48 : 60"
              style="object-fit: cover; border-radius: 4px"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>
          <template v-if="column.key === 'advType'">
            <a-tag color="blue">{{ record.advType === 1 ? '轮播图' : '其他' }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'default'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="isMobile ? 0 : 4" wrap>
              <a-button type="link" size="small" @click="toggleStatus(record)" class="px-1">
                <template #icon>
                  <component :is="record.status === 0 ? CheckCircleOutlined : StopOutlined" />
                </template>
                <span v-if="!isMobile">{{ record.status === 1 ? '禁用' : '启用' }}</span>
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

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="showModal"
      :title="editingAdv ? '编辑广告' : '添加广告'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="广告标题" required>
          <a-input v-model:value="formState.name" placeholder="请输入广告标题" />
        </a-form-item>
        <a-form-item label="图片地址" required>
          <a-input v-model:value="formState.imgUrl" placeholder="请输入图片地址" />
          <div v-if="formState.imgUrl" class="mt-2">
            <a-image :src="formState.imgUrl" :width="200" />
          </div>
        </a-form-item>
        <a-form-item label="跳转链接">
          <a-input v-model:value="formState.linkUrl" placeholder="请输入跳转链接" />
        </a-form-item>
        <a-form-item label="广告类型">
          <a-select v-model:value="formState.advType">
            <a-select-option :value="1">轮播图</a-select-option>
            <a-select-option :value="2">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
