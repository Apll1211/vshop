<script setup lang="ts">
import { LockOutlined, ShopOutlined, UserOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "@/stores";

const router = useRouter();
const adminStore = useAdminStore();

const loginType = ref<"admin" | "merchant">("admin");

const formState = ref({
	account: "",
	password: "",
});

const loading = ref(false);

const handleSubmit = async () => {
	if (!formState.value.account || !formState.value.password) {
		message.warning("请输入用户名/手机号和密码");
		return;
	}

	loading.value = true;
	try {
		let result: { success: boolean; message?: string };
		if (loginType.value === "admin") {
			result = await adminStore.login({
				adminName: formState.value.account,
				password: formState.value.password,
			});
		} else {
			result = await adminStore.login({
				adminName: formState.value.account,
				password: formState.value.password,
			});
		}

		if (result.success) {
			message.success("登录成功");
			router.push("/admin");
		} else {
			message.error(result.message || "登录失败");
		}
	} catch (error: any) {
		message.error(error.message || "登录失败，请稍后重试");
	} finally {
		loading.value = false;
	}
};

defineExpose({
	handleSubmit,
});
</script>

<template>
  <div class="login-container min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- 呼吸背景装饰 -->
    <div class="breathing-bg absolute inset-0">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="relative z-10 w-full max-w-md px-6">
      <div class="login-card bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 animate-float">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="9" fill="#000000" />
              <path d="M8 8h16v4.5L15.5 19 14 17.5 20 12.5H8V8z" fill="#FFFFFF" />
              <path d="M24 24H8v-4.5L16.5 13 18 14.5 12 19.5h12V24z" fill="#FFFFFF" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-6">南渡后台管理系统</h1>
          
          <!-- 登录类型切换 (全白色文字设计) -->
          <div class="login-type-switch flex justify-center p-1 bg-white/10 rounded-lg border border-white/10 relative">
            <!-- 滑动背景 -->
            <div 
              class="slider-bg absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-md transition-all duration-300 ease-in-out"
              :style="{ left: loginType === 'admin' ? '4px' : 'calc(50%)' }"
            ></div>
            
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all relative z-10"
              :class="loginType === 'admin' ? 'text-white' : 'text-white/60 hover:text-white'"
              @click="loginType = 'admin'"
            >
              管理员登录
            </button>
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all relative z-10"
              :class="loginType === 'merchant' ? 'text-white' : 'text-white/60 hover:text-white'"
              @click="loginType = 'merchant'"
            >
              商户登录
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <a-form
          :model="formState"
          @finish="handleSubmit"
          layout="vertical"
          class="space-y-6"
        >
          <a-form-item
            :label="loginType === 'admin' ? '管理员账号' : '商户账号/手机号'"
            name="account"
            class="mb-4 white-label"
          >
            <a-input
              v-model:value="formState.account"
              size="large"
              :placeholder="loginType === 'admin' ? '请输入管理员账号' : '请输入手机号/商户名'"
              class="custom-input"
            >
              <template #prefix>
                <UserOutlined class="text-slate-400" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            label="登录密码"
            name="password"
            class="mb-6 white-label"
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
              class="h-12 bg-white text-blue-600 border-0 font-bold hover:bg-white/90 shadow-xl"
            >
              进入系统
            </a-button>
          </a-form-item>
        </a-form>

        <div class="mt-8 text-center border-t border-white/10 pt-6">
          <router-link to="/" class="text-white/60 hover:text-white transition-colors text-sm">
            ← 返回商城首页
          </router-link>
        </div>
      </div>

      <p class="text-center text-white/40 text-sm mt-8">
        © 2026 南渡商城 技术支持
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background-color: #0f172a;
}

/* 呼吸背景动画 */
.breathing-bg {
  filter: blur(80px);
}

.circle {
  position: absolute;
  border-radius: 50%;
  animation: breathe 8s infinite alternate ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
  animation-delay: -4s;
}

@keyframes breathe {
  0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
  100% { transform: scale(1.3) translate(20px, 30px); opacity: 0.8; }
}

/* 卡片浮动动画 */
.animate-float {
  animation: float 6s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.white-label :deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500;
}

/* 输入框背景改为纯白色 */
.custom-input :deep(.ant-input),
.custom-input :deep(.ant-input-password),
.custom-input.ant-input-affix-wrapper {
  background-color: #ffffff !important;
  border-color: transparent !important;
  color: #1e293b !important;
}

.custom-input :deep(.ant-input::placeholder) {
  color: #94a3b8 !important;
}

.custom-input.ant-input-affix-wrapper:hover,
.custom-input.ant-input-affix-wrapper-focused {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
}

/* 强制切换按钮文字为白色 */
.login-type-switch button {
  color: white !important;
  outline: none;
  border: none;
  background: transparent;
}

.login-type-switch button:not(.text-white) {
  opacity: 0.6;
}

.login-type-switch button:hover {
  opacity: 1;
}

.slider-bg {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
