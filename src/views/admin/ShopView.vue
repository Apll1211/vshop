<script setup lang="ts">
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	ShopOutlined,
	SearchOutlined,
	ClearOutlined,
	ReloadOutlined,
} from "@ant-design/icons-vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Modal, message } from "ant-design-vue";
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import { deleteShop, getShopList, saveShop } from "@/api";
import { getFileUrl } from "@/api/request";
import type { Shop } from "@/api/types";
import FileUpload from "@/components/FileUpload.vue";
import { formatDate } from "@/lib/utils";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller("md").value);

const loading = ref(false);
const shopData = ref<any[]>([]);
const searchName = ref("");
const pagination = reactive({
	current: 1,
	pageSize: 10,
	total: 0,
});
const showModal = ref(false);
const editingShop = ref<any | null>(null);
const formState = reactive({
	id: "",
	name: "",
	logo: "",
	description: "",
	status: 1,
});

const columns = computed(() => [
	{ title: "店铺Logo", dataIndex: "logo", key: "logo", width: 100, align: "center" },
	{ title: "店铺名称", dataIndex: "name", key: "name", minWidth: 150 },
	{ title: "所属商家", dataIndex: "merchantName", key: "merchantName", minWidth: 120 },
	{ title: "创建时间", dataIndex: "created_at", key: "created_at", width: 180 },
	{ title: "状态", dataIndex: "status", key: "status", width: 100, align: "center" },
	{ title: "操作", key: "action", width: 160 },
]);

const fetchShops = async () => {
	loading.value = true;
	try {
		const res = await getShopList({
			pageNo: pagination.current,
			pageSize: pagination.pageSize,
			name: searchName.value || undefined,
		});
		const data = res as any;
		const list = data.shopList || (data.data && data.data.shopList) || data.list || [];
		
		shopData.value = list.map((item: any) => ({
			...item,
			_id: item.id || item._id,
		}));
		pagination.total = data.count || (data.data && data.data.count) || list.length;
	} catch (error) {
		message.error("获取店铺列表失败");
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pagination.current = 1;
	fetchShops();
};

const handleReset = () => {
	searchName.value = "";
	pagination.current = 1;
	fetchShops();
};

const handleTableChange = (pag: any) => {
	pagination.current = pag.current;
	pagination.pageSize = pag.pageSize;
	fetchShops();
};

const openModal = (shop?: any) => {
	editingShop.value = shop || null;
	if (shop) {
		Object.assign(formState, {
			id: shop.id || shop._id,
			name: shop.name,
			logo: shop.logo || "",
			description: shop.description || "",
			status: shop.status,
		});
	} else {
		Object.assign(formState, {
			id: "",
			name: "",
			logo: "",
			description: "",
			status: 1,
		});
	}
	showModal.value = true;
};

const handleSubmit = async () => {
	if (!formState.name) return message.warning("请输入店铺名称");
	loading.value = true;
	try {
		await saveShop(formState as any);
		message.success(editingShop.value ? "修改成功" : "添加成功");
		showModal.value = false;
		fetchShops();
	} catch (error: any) {
		message.error(error.message || "操作失败");
	} finally {
		loading.value = false;
	}
};

const handleDelete = (shop: any) => {
	const id = shop.id || shop._id;
	Modal.confirm({
		title: "确认删除",
		icon: createVNode(ExclamationCircleOutlined),
		content: `确定要删除店铺 "${shop.name}" 吗？`,
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

onMounted(() => {
	fetchShops();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-800">店铺管理</h1>
      <div class="flex gap-2">
        <a-input
          v-model:value="searchName"
          placeholder="搜索店铺名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="openModal()">
          <PlusOutlined /> 添加店铺
        </a-button>
      </div>
    </div>

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
          showTotal: (total: number) => `共 ${total} 个店铺`,
          size: isMobile ? 'small' : 'default',
        }"
        row-key="_id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logo'">
            <!-- 自动适配：getFileUrl 内部逻辑会识别 record.logo 中的 ID 结构 -->
            <a-avatar :src="getFileUrl(record.logo, undefined, 'shop/logo')" :size="48" shape="square">
              <template #icon><ShopOutlined /></template>
            </a-avatar>
          </template>
          
          <template v-if="column.key === 'merchantName'">
            <div class="flex flex-col">
              <span class="font-medium">{{ record.merchantName || '系统自营' }}</span>
              <span class="text-[10px] text-slate-400">{{ record.merchantRole === 'admin' ? '总后台' : '商家' }}</span>
            </div>
          </template>

          <template v-if="column.key === 'created_at'">
            <span class="text-slate-500 text-xs">{{ formatDate(record.created_at) }}</span>
          </template>

          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 1 ? 'success' : 'error'" :text="record.status === 1 ? '正常营业' : '暂停服务'" />
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
      :title="editingShop ? '编辑店铺' : '添加店铺'"
      @ok="handleSubmit"
      :confirm-loading="loading"
      :width="isMobile ? '95%' : '600px'"
    >
      <a-form layout="vertical">
        <a-form-item label="店铺Logo">
          <FileUpload 
            v-model:value="formState.logo" 
            directory="shop/logo"
            :contextId="formState.id"
          />
        </a-form-item>
        <a-form-item label="店铺名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入店铺名称" />
        </a-form-item>
        <a-form-item label="店铺描述">
          <a-textarea v-model:value="formState.description" placeholder="请输入店铺描述" :rows="3" />
        </a-form-item>
        <a-form-item label="营业状态">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">正常营业</a-radio>
            <a-radio :value="0">暂停服务</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
