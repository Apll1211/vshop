<script setup lang="ts">
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { ref, watch } from "vue";
import { uploadImage } from "@/api/upload";
import { getFileUrl } from "@/api/request";

interface Props {
  value?: string | string[]; // 当前图片地址或路径数组
  maxCount?: number;         // 最大上传数量
  listType?: 'text' | 'picture' | 'picture-card';
  buttonText?: string;
  // 以下参数用于在后端返回不严谨时，在前端辅助缝合路径
  directory?: 'admin/avatar' | 'shop/logo' | 'spu' | 'adv'; 
  contextId?: string;        // 关联ID (如userId, shopId)
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 1,
  listType: 'picture-card',
  buttonText: '上传图片'
});

const emit = defineEmits(['update:value', 'change']);

const loading = ref(false);
const fileList = ref<any[]>([]);

// 监听外部传入的 value 变化，同步到展示列表
watch(() => props.value, (newVal) => {
  if (!newVal) {
    fileList.value = [];
    return;
  }
  
  const urls = Array.isArray(newVal) ? newVal : [newVal];
  fileList.value = urls.map((url, index) => ({
    uid: `-${index}`,
    name: `image-${index}`,
    status: 'done',
    url: getFileUrl(url, props.contextId, props.directory as any),
    rawPath: url 
  }));
}, { immediate: true, deep: true });

// 处理路径缝合 (模仿 getFileUrl 的逻辑，但在上传存入数据库前处理)
const stitchPath = (rawPath: string): string => {
  let path = rawPath.replace(/^\/+/, "").replace(/^upload\//, "");
  
  // 如果路径中不包含目录结构且有明确的 directory
  if (!path.includes("/") && props.directory) {
    if (props.contextId) {
      path = `${props.directory}/${props.contextId}/${path}`;
    } else {
      path = `${props.directory}/${path}`;
    }
  }
  return path;
};

// 自定义上传逻辑
const handleCustomRequest = async (options: any) => {
  const { file, onSuccess, onError } = options;
  loading.value = true;
  try {
    const res = await uploadImage(file as File);
    const data = res as any;
    // 获取返回的原始路径
    let rawPath = data.url || data.data?.url || data.imgUrl || data.avatar;
    
    if (rawPath) {
      // 核心补全：在存入数据库前，根据后端人员的要求补全目录
      const finalPath = stitchPath(rawPath);
      
      onSuccess(res, file);
      
      // 更新父组件绑定的数据
      if (props.maxCount === 1) {
        emit('update:value', finalPath);
        emit('change', finalPath);
      } else {
        const currentPaths = Array.isArray(props.value) ? [...props.value] : [];
        currentPaths.push(finalPath);
        emit('update:value', currentPaths);
        emit('change', currentPaths);
      }
      message.success('上传成功');
    } else {
      throw new Error('服务器未返回有效路径');
    }
  } catch (error: any) {
    onError(error);
    message.error(error.message || '上传失败');
  } finally {
    loading.value = false;
  }
};

const handleRemove = (file: any) => {
  const removedPath = file.rawPath;
  if (props.maxCount === 1) {
    emit('update:value', '');
    emit('change', '');
  } else {
    const currentPaths = Array.isArray(props.value) ? props.value.filter(p => p !== removedPath) : [];
    emit('update:value', currentPaths);
    emit('change', currentPaths);
  }
};
</script>

<template>
  <div class="clearfix">
    <a-upload
      v-model:file-list="fileList"
      :list-type="listType"
      :max-count="maxCount"
      :custom-request="handleCustomRequest"
      @remove="handleRemove"
    >
      <div v-if="fileList.length < maxCount">
        <loading-outlined v-if="loading" />
        <plus-outlined v-else />
        <div style="margin-top: 8px">{{ buttonText }}</div>
      </div>
    </a-upload>
  </div>
</template>

<style scoped>
.clearfix :deep(.ant-upload-select-picture-card) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
