<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Phone, Lock, User, Eye, EyeOff } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeTab = ref(route.name === 'register' ? 'register' : 'login')
const showPassword = ref(false)
const loading = ref(false)

const loginForm = ref({
  phone: '',
  password: '',
})

const registerForm = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  username: '',
})

const redirect = computed(() => route.query.redirect as string || '/')

const formVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const direction = computed(() => activeTab.value === 'register' ? 1 : -1)

const handleLogin = async () => {
  if (!loginForm.value.phone) {
    toast.error('请输入手机号')
    return
  }
  if (!loginForm.value.password) {
    toast.error('请输入密码')
    return
  }

  loading.value = true
  try {
    await userStore.loginAction({
      phone: loginForm.value.phone,
      password: loginForm.value.password,
    })
    toast.success('登录成功')
    router.push(redirect.value)
  } catch (error: any) {
    toast.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.phone) {
    toast.error('请输入手机号')
    return
  }
  if (!registerForm.value.password) {
    toast.error('请输入密码')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error('两次密码不一致')
    return
  }

  loading.value = true
  try {
    await userStore.registerAction({
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      username: registerForm.value.username || undefined,
    })
    toast.success('注册成功，请登录')
    activeTab.value = 'login'
    loginForm.value.phone = registerForm.value.phone
  } catch (error: any) {
    toast.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md relative">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <h1 class="text-3xl font-bold text-blue-600">南渡商城</h1>
        </router-link>
        <p class="text-slate-500 mt-2">欢迎回来</p>
      </div>

      <Card class="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
        <CardHeader class="pb-2">
          <div class="flex rounded-xl bg-blue-50 p-1">
            <button
              class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300"
              :class="activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'"
              @click="activeTab = 'login'"
            >
              登录
            </button>
            <button
              class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300"
              :class="activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'"
              @click="activeTab = 'register'"
            >
              注册
            </button>
          </div>
        </CardHeader>

        <CardContent class="pt-4 overflow-hidden">
          <AnimatePresence mode="wait" :custom="direction">
            <motion.div
              v-if="activeTab === 'login'"
              key="login"
              :custom="direction"
              :variants="formVariants"
              initial="enter"
              animate="center"
              exit="exit"
              :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
            >
              <form @submit.prevent="handleLogin" class="space-y-4">
                <div class="space-y-2">
                  <Label for="login-phone">手机号</Label>
                  <div class="relative">
                    <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="login-phone" v-model="loginForm.phone" type="tel" placeholder="请输入手机号"
                      class="pl-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="login-password">密码</Label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="login-password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
                      placeholder="请输入密码" class="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                      @click="showPassword = !showPassword">
                      <Eye v-if="!showPassword" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-slate-500">记住我</span>
                  </label>
                  <a href="#" class="text-blue-600 hover:text-blue-700 hover:underline">忘记密码?</a>
                </div>
                <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white" :disabled="loading">
                  {{ loading ? '登录中...' : '登录' }}
                </Button>
              </form>
            </motion.div>

            <motion.div v-else key="register" :custom="direction" :variants="formVariants" initial="enter"
              animate="center" exit="exit" :transition="{ type: 'spring', stiffness: 300, damping: 30 }">
              <form @submit.prevent="handleRegister" class="space-y-4">
                <div class="space-y-2">
                  <Label for="register-phone">手机号</Label>
                  <div class="relative">
                    <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="register-phone" v-model="registerForm.phone" type="tel" placeholder="请输入手机号"
                      class="pl-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="register-username">用户名 (选填)</Label>
                  <div class="relative">
                    <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="register-username" v-model="registerForm.username" type="text" placeholder="请输入用户名"
                      class="pl-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="register-password">密码</Label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="register-password" v-model="registerForm.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" class="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500" @click="showPassword = !showPassword">
                      <Eye v-if="!showPassword" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="register-confirm">确认密码</Label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input id="register-confirm" v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" class="pl-10 border-slate-200 focus:border-blue-400 focus-visible:ring-blue-400" />
                  </div>
                </div>
                <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white" :disabled="loading">
                  {{ loading ? '注册中...' : '注册' }}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <div class="px-6 pb-6">
          <Separator class="my-4" />
          <p class="text-center text-sm text-slate-500 mb-4">其他登录方式</p>
          <div class="flex justify-center gap-4">
            <!-- 微信登录 -->
            <Button variant="outline" size="icon" class="rounded-full border-slate-200 hover:border-green-400 hover:text-green-500 hover:bg-green-50" title="微信登录">
              <svg class="w-5 h-5" viewBox="0 0 1024 1024" fill="currentColor">
                <path d="M690.1 377.4c5.9 0 11.8 0.2 17.6 0.5-24.4-128.7-158.3-227.1-319.9-227.1C209 150.8 64 271.4 64 420.2c0 81.1 43.6 154.2 111.9 203.6 5.5 3.9 9.1 10.3 9.1 17.6 0 2.4-0.5 4.6-1.1 6.9-5.5 20.3-14.2 52.8-14.6 54.3-0.7 2.6-1.7 5.2-1.7 7.9 0 5.9 4.8 10.8 10.8 10.8 2.3 0 4.2-0.9 6.2-2l70.9-40.9c5.3-3.1 11-5 17.2-5 3.2 0 6.4 0.5 9.5 1.4 33.1 9.5 68.8 14.8 105.7 14.8 6 0 11.9-0.1 17.8-0.4-7.1-21-10.9-43.1-10.9-66 0-135.8 132.2-245.8 295.3-245.8z m-194.3-86.5c23.8 0 43.2 19.3 43.2 43.1s-19.3 43.1-43.2 43.1c-23.8 0-43.2-19.3-43.2-43.1s19.4-43.1 43.2-43.1z m-215.9 86.2c-23.8 0-43.2-19.3-43.2-43.1s19.3-43.1 43.2-43.1 43.2 19.3 43.2 43.1-19.4 43.1-43.2 43.1zM866.7 792.7c56.9-41.2 93.2-102 93.2-169.7 0-124-120.8-224.5-269.9-224.5-149 0-269.9 100.5-269.9 224.5S540.9 847.5 690 847.5c30.8 0 60.6-4.4 88.1-12.3 2.6-0.8 5.2-1.2 7.9-1.2 5.2 0 9.9 1.6 14.3 4.1l59.1 34c1.7 1 3.3 1.7 5.2 1.7 2.4 0 4.7-0.9 6.4-2.6 1.7-1.7 2.6-4 2.6-6.4 0-2.2-0.9-4.4-1.4-6.6-0.3-1.2-7.6-28.3-12.2-45.3-0.5-1.9-0.9-3.8-0.9-5.7 0.1-5.9 3.1-11.2 7.6-14.5zM600.2 587.2c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c0 19.8-16.2 35.9-36 35.9z m179.9 0c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c-0.1 19.8-16.2 35.9-36 35.9z" />
              </svg>
            </Button>
            <!-- QQ登录 -->
            <Button variant="outline" size="icon" class="rounded-full border-slate-200 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50" title="QQ登录">
              <svg class="w-5 h-5" viewBox="0 0 1024 1024" fill="currentColor">
                <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
      <p class="text-center text-sm text-slate-500 mt-6">
        继续即表示您同意我们的
        <a href="#" class="text-blue-600 hover:underline">服务条款</a>
        和
        <a href="#" class="text-blue-600 hover:underline">隐私政策</a>
      </p>
    </div>
  </div>
</template>