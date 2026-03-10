<script setup lang="ts">
import {
	Banknote,
	ChevronRight,
	CreditCard,
	MapPin,
	Package,
	ShieldCheck,
	Wallet,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { getAddressList, submitOrder } from "@/api";
import type { UserAddress } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const addresses = ref<UserAddress[]>([]);
const selectedAddressId = ref<string>("");
const paymentMethod = ref<number>(1); // 1: 支付宝, 2: 微信, 3: 银行卡
const loading = ref(false);
const submitting = ref(false);

const formatPrice = (price: string | number) => {
	const p = typeof price === "string" ? parseFloat(price) : price;
	return (p / 100).toFixed(2);
};

const selectedAddress = computed(() => {
	return addresses.value.find((a) => a.id === selectedAddressId.value);
});

const fetchAddresses = async () => {
	try {
		loading.value = true;
		const res = (await getAddressList()) as any;
		if (res && res.code === 200) {
			addresses.value = res.data || [];
			if (addresses.value.length > 0) {
				// 默认选择第一个或默认地址
				const defaultAddr = addresses.value.find((a) => a.isDefault === 1);
				selectedAddressId.value =
					defaultAddr?.id || addresses.value[0]?.id || "";
			}
		}
	} catch (error) {
		console.error("获取地址失败:", error);
	} finally {
		loading.value = false;
	}
};

const handleSubmit = async () => {
	if (!selectedAddressId.value) {
		toast.error("请选择收货地址");
		return;
	}

	if (cartStore.checkedCartList.length === 0) {
		toast.error("请选择要结算的商品");
		return;
	}

	submitting.value = true;
	try {
		const skuInfoList = cartStore.checkedCartList.map((item) => ({
			skuId: item.skuId,
			skuNum: item.skuNum,
		}));

		const res = (await submitOrder({
			addressId: selectedAddressId.value,
			skuInfoList,
			paymentMethod: paymentMethod.value,
      consignee: selectedAddress.value?.consignee || '',
      consigneeTel: selectedAddress.value?.phone || '',
      deliveryAddress: selectedAddress.value?.detailAddress || '',
      paymentWay: paymentMethod.value === 1 ? '支付宝' : '微信'
		})) as any;

		if (res && res.code === 200) {
			toast.success("订单提交成功");
			router.push({
				name: "pay",
				params: { orderId: res.data || res.orderId },
			});
		} else {
      toast.error(res.message || "订单提交失败");
    }
	} catch (error: any) {
		toast.error(error.message || "订单提交失败");
	} finally {
		submitting.value = false;
	}
};

onMounted(() => {
	if (!userStore.isLoggedIn) {
		router.push({ name: "login", query: { redirect: "/checkout" } });
		return;
	}

	if (cartStore.checkedCartList.length === 0) {
		router.push({ name: "cart" });
		return;
	}

	fetchAddresses();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-zinc-800 mb-6">确认订单</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧内容 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 收货地址 -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="flex items-center gap-2 text-base">
                <MapPin class="w-5 h-5 text-emerald-600" />
                收货地址
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="loading" class="py-4 text-center text-zinc-500">
                加载中...
              </div>
              <div v-else-if="addresses.length === 0" class="py-4 text-center">
                <p class="text-zinc-500 mb-4">暂无收货地址</p>
                <Button @click="router.push({ name: 'address' })">
                  添加地址
                </Button>
              </div>
              <RadioGroup v-else v-model="selectedAddressId" class="space-y-3">
                <Label
                  v-for="address in addresses"
                  :key="address.id"
                  class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-emerald-300 transition-colors"
                  :class="selectedAddressId === address.id ? 'border-emerald-500 bg-emerald-50' : ''"
                >
                  <RadioGroupItem :value="address.id" class="mt-1" />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ address.consignee }}</span>
                      <span class="text-zinc-500">{{ address.phone }}</span>
                      <Badge v-if="address.isDefault === 1" variant="secondary" class="text-xs">
                        默认
                      </Badge>
                    </div>
                    <p class="text-sm text-zinc-500 mt-1">
                      {{ address.provinceName }} {{ address.cityName }} {{ address.districtName }} {{ address.detailAddress }}
                    </p>
                  </div>
                </Label>
              </RadioGroup>
              <Button v-if="addresses.length > 0" variant="link" class="mt-3 p-0 text-emerald-600">
                添加新地址
              </Button>
            </CardContent>
          </Card>

          <!-- 支付方式 -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="flex items-center gap-2 text-base">
                <CreditCard class="w-5 h-5 text-emerald-600" />
                支付方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup v-model="paymentMethod" class="grid grid-cols-3 gap-4">
                <Label class="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:border-emerald-300 transition-colors" :class="paymentMethod === 1 ? 'border-emerald-500 bg-emerald-50' : ''">
                  <RadioGroupItem :value="1" class="sr-only" />
                  <Wallet class="w-8 h-8 text-blue-500" />
                  <span class="text-sm">支付宝</span>
                </Label>
                <Label class="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:border-emerald-300 transition-colors" :class="paymentMethod === 2 ? 'border-emerald-500 bg-emerald-50' : ''">
                  <RadioGroupItem :value="2" class="sr-only" />
                  <svg class="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" />
                  </svg>
                  <span class="text-sm">微信支付</span>
                </Label>
                <Label class="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:border-emerald-300 transition-colors" :class="paymentMethod === 3 ? 'border-emerald-500 bg-emerald-50' : ''">
                  <RadioGroupItem :value="3" class="sr-only" />
                  <Banknote class="w-8 h-8 text-amber-500" />
                  <span class="text-sm">银行卡</span>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          <!-- 商品清单 -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="flex items-center gap-2 text-base">
                <Package class="w-5 h-5 text-emerald-600" />
                商品清单
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="item in cartStore.checkedCartList"
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
        </div>

        <!-- 右侧结算面板 -->
        <div class="lg:col-span-1">
          <Card class="sticky top-4">
            <CardContent class="p-6 space-y-4">
              <h3 class="font-medium text-zinc-800">订单信息</h3>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-zinc-500">商品金额</span>
                  <span>¥{{ cartStore.totalPrice.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">运费</span>
                  <span class="text-emerald-600">免运费</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">优惠</span>
                  <span class="text-rose-500">-¥0.00</span>
                </div>
              </div>

              <div class="border-t pt-4">
                <div class="flex justify-between items-baseline">
                  <span class="text-zinc-500">应付总额</span>
                  <span class="text-2xl font-bold text-rose-500">
                    ¥{{ cartStore.totalPrice.toFixed(2) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm text-zinc-500">
                <ShieldCheck class="w-4 h-4 text-emerald-500" />
                正品保障，极速发货
              </div>

              <Button
                class="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                size="lg"
                @click="handleSubmit"
                :disabled="submitting || !selectedAddressId"
              >
                {{ submitting ? '提交中...' : '提交订单' }}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
