<script setup lang="ts">
import { Mail, MapPin, MessageCircle, Phone } from "lucide-vue-next";
import { RouterLink } from "vue-router";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-slate-900 text-white relative z-10">
    <!-- 主要内容区 -->
    <div class="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- 公司信息 -->
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <path d="M8 8h16v4.5L15.5 19 14 17.5 20 12.5H8V8z" fill="#FFFFFF" />
                <path d="M24 24H8v-4.5L16.5 13 18 14.5 12 19.5h12V24z" fill="#FFFFFF" />
              </svg>
            </div>
            <div class="flex flex-col">
              <h3 class="text-xl font-bold leading-tight">南渡商城</h3>
              <p class="text-sm text-blue-300 leading-normal">品质生活，从这里开始</p>
            </div>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">
            南渡商城致力于为用户提供优质、便捷的购物体验。我们精选各类商品，确保品质与服务的双重保障。
          </p>
          <div class="flex items-center gap-4">
            <!-- 微信图标 -->
            <a href="#" class="w-10 h-10 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors" title="微信">
              <svg class="w-5 h-5" viewBox="0 0 1024 1024" fill="currentColor">
                <path d="M690.1 377.4c5.9 0 11.8 0.2 17.6 0.5-24.4-128.7-158.3-227.1-319.9-227.1C209 150.8 64 271.4 64 420.2c0 81.1 43.6 154.2 111.9 203.6 5.5 3.9 9.1 10.3 9.1 17.6 0 2.4-0.5 4.6-1.1 6.9-5.5 20.3-14.2 52.8-14.6 54.3-0.7 2.6-1.7 5.2-1.7 7.9 0 5.9 4.8 10.8 10.8 10.8 2.3 0 4.2-0.9 6.2-2l70.9-40.9c5.3-3.1 11-5 17.2-5 3.2 0 6.4 0.5 9.5 1.4 33.1 9.5 68.8 14.8 105.7 14.8 6 0 11.9-0.1 17.8-0.4-7.1-21-10.9-43.1-10.9-66 0-135.8 132.2-245.8 295.3-245.8z m-194.3-86.5c23.8 0 43.2 19.3 43.2 43.1s-19.3 43.1-43.2 43.1c-23.8 0-43.2-19.3-43.2-43.1s19.4-43.1 43.2-43.1z m-215.9 86.2c-23.8 0-43.2-19.3-43.2-43.1s19.3-43.1 43.2-43.1 43.2 19.3 43.2 43.1-19.4 43.1-43.2 43.1zM866.7 792.7c56.9-41.2 93.2-102 93.2-169.7 0-124-120.8-224.5-269.9-224.5-149 0-269.9 100.5-269.9 224.5S540.9 847.5 690 847.5c30.8 0 60.6-4.4 88.1-12.3 2.6-0.8 5.2-1.2 7.9-1.2 5.2 0 9.9 1.6 14.3 4.1l59.1 34c1.7 1 3.3 1.7 5.2 1.7 2.4 0 4.7-0.9 6.4-2.6 1.7-1.7 2.6-4 2.6-6.4 0-2.2-0.9-4.4-1.4-6.6-0.3-1.2-7.6-28.3-12.2-45.3-0.5-1.9-0.9-3.8-0.9-5.7 0.1-5.9 3.1-11.2 7.6-14.5zM600.2 587.2c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c0 19.8-16.2 35.9-36 35.9z m179.9 0c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c-0.1 19.8-16.2 35.9-36 35.9z" />
              </svg>
            </a>
            <!-- QQ图标 -->
            <a href="#" class="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center transition-colors" title="QQ">
              <svg class="w-5 h-5" viewBox="0 0 1024 1024" fill="currentColor">
                <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" />
              </svg>
            </a>
            <!-- 客服图标 -->
            <a href="#" class="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center transition-colors" title="在线客服">
              <MessageCircle class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- 快速链接 -->
        <div>
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b border-slate-700">快速链接</h4>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/" class="text-slate-400 hover:text-blue-300 transition-colors">首页</RouterLink>
            </li>
            <li>
              <RouterLink to="/search" class="text-slate-400 hover:text-blue-300 transition-colors">商品搜索</RouterLink>
            </li>
            <li>
              <RouterLink to="/cart" class="text-slate-400 hover:text-blue-300 transition-colors">购物车</RouterLink>
            </li>
            <li>
              <RouterLink to="/orders" class="text-slate-400 hover:text-blue-300 transition-colors">我的订单</RouterLink>
            </li>
          </ul>
        </div>

        <!-- 客户服务 -->
        <div>
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b border-slate-700">客户服务</h4>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/about" class="text-slate-400 hover:text-blue-300 transition-colors">关于我们</RouterLink>
            </li>
            <li>
              <RouterLink to="/admin/login" class="text-slate-400 hover:text-blue-300 transition-colors">商家后台</RouterLink>
            </li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div>
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b border-slate-700">联系我们</h4>
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                <Phone class="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-slate-400">客服热线</p>
                <p class="font-medium">13J43QKKKA</p>
              </div>
            </li>
            <li class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                <Mail class="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-slate-400">电子邮箱</p>
                <p class="font-medium">13J43QKKKA@yuma.com</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                <MapPin class="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-slate-400">公司地址</p>
                <p class="font-medium">上可通凌霄,下可坠阴曹</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="border-t border-slate-700/50">
      <div class="container mx-auto px-4 lg:px-8 py-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>&copy; {{ currentYear }} 赵延博 版权所有</p>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-blue-300 transition-colors">京ICP备12345678号</a>
            <span class="text-slate-600">|</span>
            <a href="#" class="hover:text-blue-300 transition-colors">营业执照</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
