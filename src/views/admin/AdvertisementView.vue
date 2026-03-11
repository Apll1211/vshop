<script setup lang="ts">
import {
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	StopOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import { createAdv, deleteAdv, getAdvList, updateAdv, updateAdvStatus } from "@/api";
import { getFileUrl } from "@/api/request";
import type { Advertisement } from "@/api/types";
import FileUpload from "@/components/FileUpload.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

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
const formState = reactive({
	name: "",
	imgUrl: "",
	linkUrl: "",
	advType: 1,
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
	{ title: "广告图片", dataIndex: "imgUrl", key: "imgUrl", width: 120, align: 'center' },
	{ title: "标题", dataIndex: "name", key: "name", minWidth: 150 },
	{ title: "链接", dataIndex: "linkUrl", key: "linkUrl", minWidth: 200 },
	{ title: "状态", dataIndex: "status", key: "status", width: 100, align: 'center' },
	{ title: "操作", key: "action", width: 180 },
]);

const displayedColumns = computed(() => {
	if (isMobile.value) {
		return columns.value.filter(
			(col) => ["imgUrl", "name", "status", "action"].includes(col.key as string),
		);
	}
	return columns.value;
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
		const data = res as any;
		const list = data.data || (data.data && data.data.data) || (Array.isArray(data) ? data : []);
		advData.value = list.map((item: any) => ({
			...item,
			_id: item._id || item.id,
		}));
		pagination.total = data.total || list.length;
		selectedRowKeys.value = [];
	} catch (error) {
		console.error("获取广告列表失败:", error);
		message.error("获取广告列表失败");
	} finally {
		loading.value = false;
	}
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchAdvList();
};

// 打开弹窗
const openModal = (adv?: Advertisement) => {
	if (adv) {
		editingAdv.value = adv;
		Object.assign(formState, {
			name: adv.name || (adv as any).title || "",
			imgUrl: adv.imgUrl || "",
			linkUrl: adv.linkUrl || "",
			advType: (adv as any).advType || 1,
			sort: adv.sort || 0,
		});
	} else {
		editingAdv.value = null;
		Object.assign(formState, {
			name: "",
			imgUrl: "",
			linkUrl: "",
			advType: 1,
			sort: 0,
		});
	}
	showModal.value = true;
};

// 提交表单
const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入广告标题");
	if (!formState.imgUrl) return message.warning("请上传广告图片");

	try {
		loading.value = true;
		const payload: any = { ...formState };

		if (editingAdv.value) {
			payload.id = editingAdv.value._id || (editingAdv.value as any).id;
			await updateAdv(payload);
			message.success("修改成功");
		} else {
			await createAdv(payload);
			message.success("添加成功");
		}
		showModal.value = false;
		fetchAdvList();
	} catch (error: any) {
		message.error(error.message || "提交失败");
	} finally {
		loading.value = false;
	}
};

// 切换状态
const toggleStatus = async (adv: Advertisement) => {
	const newStatus = adv.status === 1 ? 0 : 1;
	const id = adv._id || (adv as any).id;
	try {
		await updateAdvStatus(id, newStatus);
		message.success(newStatus === 1 ? "已启用" : "已禁用");
		fetchAdvList();
	} catch (error: any) {
		message.error(error.message || "操作失败");
	}
};

const executeBatchDelete = async (ids: string[]) => {
	const hide = message.loading(`正在执行清理...`, 0);
	let successCount = 0;
	for (const id of ids) {
		try {
			await deleteAdv(id);
			successCount++;
		} catch (e) {}
	}
	hide();
	message.success(`成功清理 ${successCount} 项记录`);
	fetchAdvList();
};

// 删除单条
const handleDelete = (adv: Advertisement) => {
	const id = adv._id || (adv as any).id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除广告"${adv.name || (adv as any).title}"吗？`,
		okText: "确认",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: async () => {
			try {
				await deleteAdv(id);
				message.success("删除成功");
				fetchAdvList();
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
		content: `确定要删除选中的 ${selectedRowKeys.value.length} 项记录吗？`,
		okText: "确认删除",
		cancelText: "取消",
		okButtonProps: { danger: true },
		onOk: () => executeBatchDelete(selectedRowKeys.value),
	});
};

onMounted(() => {
	fetchAdvList();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">广告管理</h1>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined /> 添加广告
      </a-button>
    </div>

    <a-card :body-style="{ padding: isMobile ? '12px' : '24px' }">
      <div class="flex flex-wrap items-center gap-4">
        <a-input
          v-model:value="searchTitle"
          placeholder="请输入广告标题"
          :style="{ width: isMobile ? '100%' : '200px' }"
          allow-clear
          @pressEnter="() => { pagination.current = 1; fetchAdvList(); }"
        />
        <a-button type="primary" :block="isMobile" @click="() => { pagination.current = 1; fetchAdvList(); }">搜索</a-button>
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
        :columns="displayedColumns"
        :data-source="advData"
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
          <template v-if="column.key === 'imgUrl'">
            <a-image
              :src="getFileUrl(record.imgUrl, undefined, 'adv')"
              :width="isMobile ? 80 : 100"
              :height="isMobile ? 48 : 60"
              style="object-fit: cover; border-radius: 4px"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 1 ? 'success' : 'default'" :text="record.status === 1 ? '启用' : '禁用'" />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="toggleStatus(record)">
                {{ record.status === 1 ? '禁用' : '启用' }}
              </a-button>
              <a-button type="link" size="small" @click="openModal(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="showModal"
      :title="editingAdv ? '编辑广告' : '添加广告'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="广告图片" required>
          <FileUpload v-model:value="formState.imgUrl" />
        </a-form-item>
        <a-form-item label="广告标题" required>
          <a-input v-model:value="formState.name" placeholder="请输入广告标题" />
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
