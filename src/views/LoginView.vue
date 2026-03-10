<script setup lang="ts">
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from "lucide-vue-next";
import { AnimatePresence, motion } from "motion-v";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeTab = ref(route.name === "register" ? "register" : "login");
const showPassword = ref(false);
const loading = ref(false);

const loginForm = ref({
	phone: "",
	password: "",
});

const registerForm = ref({
	username: "",
	phone: "",
	password: "",
	confirmPassword: "",
});

watch(
	() => route.name,
	(newName) => {
		activeTab.value = newName === "register" ? "register" : "login";
	},
);

const handleLogin = async () => {
	if (!loginForm.value.phone) return toast.error("请输入手机号");
	if (!loginForm.value.password) return toast.error("请输入密码");

	loading.value = true;
	try {
		const res = await userStore.loginAction({
			phone: loginForm.value.phone,
			password: loginForm.value.password,
		});
		if (res.code === 200) {
			toast.success("欢迎回来！");
			const redirect = (route.query.redirect as string) || "/";
			router.push(redirect);
		}
	} catch (error: any) {
		toast.error(error.message || "登录失败，请检查账号密码");
	} finally {
		loading.value = false;
	}
};

const handleRegister = async () => {
	if (!registerForm.value.username || !registerForm.value.phone || !registerForm.value.password) {
		return toast.error("请完整填写注册信息");
	}
	if (registerForm.value.password !== registerForm.value.confirmPassword) {
		return toast.error("两次输入的密码不一致");
	}

	loading.value = true;
	try {
		const res = await userStore.registerAction({
			username: registerForm.value.username,
			phone: registerForm.value.phone,
			password: registerForm.value.password,
		});
		if (res.code === 200) {
			toast.success("注册成功，请登录");
			activeTab.value = "login";
			loginForm.value.phone = registerForm.value.phone;
		}
	} catch (error: any) {
		toast.error(error.message || "注册失败");
	} finally {
		loading.value = false;
	}
};

const togglePassword = () => {
	showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative">
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute top-0 -right-4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- 返回按钮 -->
    <div class="absolute top-8 left-8 z-10">
      <router-link to="/">
        <Button variant="ghost" class="text-slate-600 hover:text-blue-600">
          <ArrowLeft class="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </router-link>
    </div>

    <div class="w-full max-w-[440px] z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden border border-white">
        <!-- 头部导航 -->
        <div class="flex p-1 bg-slate-100/50 m-6 rounded-xl relative">
          <button
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative z-10"
            :class="activeTab === 'login' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'login'"
          >
            账号登录
          </button>
          <button
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative z-10"
            :class="activeTab === 'register' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'register'"
          >
            立即注册
          </button>
          <!-- 滑块动画 -->
          <motion.div 
            class="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm w-[calc(50%-4px)]"
            :animate="{ x: activeTab === 'login' ? 0 : '100%' }"
            :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
          />
        </div>

        <div class="px-8 pb-10 relative">
          <AnimatePresence mode="wait">
            <!-- 登录表单 -->
            <motion.div 
              v-if="activeTab === 'login'" 
              key="login"
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: 20 }"
              :transition="{ duration: 0.3 }"
              class="space-y-6"
            >
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">欢迎回来</h2>
                <p class="text-sm text-slate-500 mt-2">请输入您的账号信息以继续</p>
              </div>

              <form @submit.prevent="handleLogin" class="space-y-4">
                <div class="space-y-2">
                  <Label for="login-phone">手机号</Label>
                  <div class="relative group">
                    <Phone class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="login-phone" name="username" autocomplete="username" v-model="loginForm.phone" type="tel" placeholder="请输入手机号" class="pl-10 h-11 bg-white/50 focus:bg-white" />
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <Label for="login-password">密码</Label>
                    <a href="#" class="text-xs text-blue-600 hover:underline">忘记密码?</a>
                  </div>
                  <div class="relative group">
                    <Lock class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="login-password" name="password" autocomplete="current-password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" class="pl-10 pr-10 h-11 bg-white/50 focus:bg-white" />
                    <button type="button" @click="togglePassword" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                      <Eye v-if="!showPassword" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Button type="submit" class="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2 shadow-lg shadow-blue-200" :disabled="loading">
                  {{ loading ? '正在登录...' : '登录' }}
                </Button>
              </form>
            </motion.div>

            <!-- 注册表单 -->
            <motion.div 
              v-else 
              key="register"
              :initial="{ opacity: 0, x: 20 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: -20 }"
              :transition="{ duration: 0.3 }"
              class="space-y-6"
            >
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">创建账号</h2>
                <p class="text-sm text-slate-500 mt-2">加入南渡商城，开启购物之旅</p>
              </div>

              <form @submit.prevent="handleRegister" class="space-y-4">
                <div class="space-y-2">
                  <Label for="reg-username">用户名</Label>
                  <div class="relative group">
                    <User class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="reg-username" name="reg-user" v-model="registerForm.username" placeholder="请输入用户名" class="pl-10 h-11 bg-white/50 focus:bg-white" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="reg-phone">手机号</Label>
                  <div class="relative group">
                    <Phone class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="reg-phone" name="reg-phone" v-model="registerForm.phone" type="tel" placeholder="请输入手机号" class="pl-10 h-11 bg-white/50 focus:bg-white" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="reg-password">设置密码</Label>
                  <div class="relative group">
                    <Lock class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="reg-password" name="new-password" autocomplete="new-password" v-model="registerForm.password" type="password" placeholder="请设置登录密码" class="pl-10 h-11 bg-white/50 focus:bg-white" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="reg-confirm">确认密码</Label>
                  <div class="relative group">
                    <ShieldCheck class="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="reg-confirm" name="confirm-password" v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" class="pl-10 h-11 bg-white/50 focus:bg-white" />
                  </div>
                </div>

                <Button type="submit" class="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2 shadow-lg shadow-blue-200" :disabled="loading">
                  {{ loading ? '正在注册...' : '立即注册' }}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-xs text-slate-400 mt-4 tracking-wider uppercase opacity-60">
          © 2026 南渡商城 · Secure Authentication
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
