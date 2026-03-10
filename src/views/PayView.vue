<script setup lang="ts">
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, CreditCard, Wallet } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { getOrderDetail, payOrder } from "@/api";
import type { Order } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const route = useRoute();
const router = useRouter();

const order = ref<Order | null>(null);
const loading = ref(true);
const paying = ref(false);
const paymentMethod = ref(1);

const formatPrice = (price: string | number) => {
	const p = typeof price === "string" ? parseFloat(price) : price;
	return (p / 100).toFixed(2);
};

const orderId = computed(() => route.params.orderId as string);

const fetchOrder = async () => {
	if (!orderId.value) return;

	try {
		loading.value = true;
		const res = (await getOrderDetail(orderId.value)) as any;
		order.value = res.data || res.order || res;
	} catch (error) {
		toast.error("获取订单信息失败");
	} finally {
		loading.value = false;
	}
};

const handlePay = async () => {
	if (!order.value) return;

	paying.value = true;
	try {
		const res = (await payOrder(order.value._id, paymentMethod.value)) as any;
		toast.success("支付成功");
		router.push({
			name: "pay-success",
			params: { orderId: order.value._id },
		});
	} catch (error: any) {
		toast.error(error.message || "支付失败");
	} finally {
		paying.value = false;
	}
};

const goBack = () => {
	router.push({ name: "orders" });
};

onMounted(() => {
	fetchOrder();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- 返回按钮 -->
        <Button variant="ghost" class="mb-6" @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          返回订单列表
        </Button>

        <Card v-if="loading" class="text-center py-16">
          <CardContent>
            <div class="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p class="text-zinc-500">加载中...</p>
          </CardContent>
        </Card>

        <template v-else-if="order">
          <!-- 订单状态 -->
          <Card class="mb-6">
            <CardContent class="p-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock class="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h1 class="text-xl font-bold text-zinc-800">等待支付</h1>
                  <p class="text-zinc-500 mt-1">请在30分钟内完成支付</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 订单信息 -->
          <Card class="mb-6">
            <CardContent class="p-6">
              <h2 class="font-medium text-zinc-800 mb-4">订单信息</h2>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-zinc-500">订单编号</span>
                  <span>{{ order.orderNo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">创建时间</span>
                  <span>{{ order.createTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">收货人</span>
                  <span>{{ order.consignee }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">联系电话</span>
                  <span>{{ order.consigneeTel }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">收货地址</span>
                  <span class="text-right">{{ order.deliveryAddress }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 商品清单 -->
          <Card class="mb-6">
            <CardContent class="p-6">
              <h2 class="font-medium text-zinc-800 mb-4">商品清单</h2>
              <div class="space-y-4">
                <div
                  v-for="item in order.orderDetailList"
                  :key="item.id"
                  class="flex gap-4 py-3 border-b last:border-b-0"
                >
                  <img
                    :src="item.imgUrl || '/placeholder.png'"
                    :alt="item.skuName"
                    class="w-16 h-16 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-zinc-800 line-clamp-1">{{ item.skuName }}</p>
                    <p class="text-sm text-zinc-500 mt-1">数量: {{ item.skuNum }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-rose-500">¥{{ formatPrice(item.skuPrice) }}</p>
                    <p class="text-sm text-zinc-500 mt-1">x{{ item.skuNum }}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 支付金额 -->
          <Card class="mb-6">
            <CardContent class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-medium text-zinc-800">支付金额</h2>
                <span class="text-2xl font-bold text-rose-500">
                  ¥{{ formatPrice(order.totalAmount) }}
                </span>
              </div>

              <!-- 支付方式选择 -->
              <div class="space-y-3">
                <p class="text-sm text-zinc-500">选择支付方式</p>
                <div class="grid grid-cols-2 gap-4">
                  <button
                    class="flex items-center gap-3 p-4 border rounded-lg transition-colors"
                    :class="paymentMethod === 1 ? 'border-emerald-500 bg-emerald-50' : 'hover:border-zinc-300'"
                    @click="paymentMethod = 1"
                  >
                    <Wallet class="w-6 h-6 text-blue-500" />
                    <span class="font-medium">支付宝</span>
                  </button>
                  <button
                    class="flex items-center gap-3 p-4 border rounded-lg transition-colors"
                    :class="paymentMethod === 2 ? 'border-emerald-500 bg-emerald-50' : 'hover:border-zinc-300'"
                    @click="paymentMethod = 2"
                  >
                    <svg class="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" />
                    </svg>
                    <span class="font-medium">微信支付</span>
                  </button>
                </div>
              </div>

              <Button
                class="w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                size="lg"
                @click="handlePay"
                :disabled="paying"
              >
                {{ paying ? '支付中...' : '立即支付' }}
              </Button>
            </CardContent>
          </Card>
        </template>

        <Card v-else class="text-center py-16">
          <CardContent>
            <AlertCircle class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
            <p class="text-zinc-500">订单不存在</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
