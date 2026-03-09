<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const router = useRouter();
const adminStore = useAdminStore();

const formState = ref({
  adminName: '',
  password: '',
});

const loading = ref(false);

const handleSubmit = async () => {
  console.log('表单提交:', formState.value);
  
  if (!formState.value.adminName || !formState.value.password) {
    message.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    console.log('开始登录...');
    const result = await adminStore.login(formState.value);
    console.log('登录结果:', result);
    if (result.success) {
      message.success('登录成功');
      router.push('/admin');
    } else {
      message.error(result.message || '登录失败');
    }
  } catch (error) {
    console.error('登录错误:', error);
    message.error('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 w-full max-w-md px-6">
      <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <span class="text-3xl font-bold text-white">Z</span>
          </div>
          <h1 class="text-2xl font-bold text-white">南渡商城商家后台</h1>
          <p class="text-slate-400 mt-2">请登录您的管理员账号</p>
        </div>

        <!-- Login Form -->
        <a-form
          :model="formState"
          @finish="handleSubmit"
          layout="vertical"
          class="space-y-6"
          :validate-messages="{
            required: '${label}不能为空',
          }"
        >
          <a-form-item
            label="用户名"
            name="adminName"
            :rules="[{ required: true, message: '请输入用户名' }]"
            class="mb-4"
          >
            <a-input
              v-model:value="formState.adminName"
              size="large"
              placeholder="请输入用户名"
              class="custom-input"
            >
              <template #prefix>
                <UserOutlined class="text-slate-400" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码' }]"
            class="mb-6"
          >
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="请输入密码"
              class="custom-input"
            >
              <template #prefix>
                <LockOutlined class="text-slate-400" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item class="mb-0">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <router-link to="/" class="text-slate-400 hover:text-blue-400 transition-colors text-sm">
            返回商城首页
          </router-link>
        </div>
      </div>

      <p class="text-center text-slate-500 text-sm mt-6">
        © 2026 南渡商城 版权所有
      </p>
    </div>
  </div>
</template>

<style scoped>
.custom-input :deep(.ant-input),
.custom-input :deep(.ant-input-password) {
  background-color: #fff !important;
  border-color: #e2e8f0 !important;
  color: #1e293b !important;
}

.custom-input :deep(.ant-input::placeholder) {
  color: #94a3b8 !important;
}

.custom-input :deep(.ant-input-affix-wrapper) {
  background-color: #fff !important;
  border-color: #e2e8f0 !important;
}

.custom-input :deep(.ant-input-affix-wrapper:hover),
.custom-input :deep(.ant-input:hover),
.custom-input :deep(.ant-input:focus) {
  border-color: #3b82f6 !important;
}

.custom-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}
</style>
