<script setup lang="ts">
import { ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-vue-next";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { getFileUrl } from "@/api/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const formatPrice = (price: string | number) => {
	const p = typeof price === "string" ? parseFloat(price) : price;
	return (p / 100).toFixed(2);
};

onMounted(() => {
	if (userStore.isLoggedIn) {
		cartStore.getCartListAction();
	}
});

const handleQuantityChange = async (id: string, newQty: number) => {
	if (newQty < 1) return;
	await cartStore.updateCartNumAction(id, newQty);
};

const handleDelete = async (id: string) => {
	const success = await cartStore.deleteCartItemAction(id);
	if (success) {
		toast.success("商品已删除");
	}
};

const handleBatchDelete = async () => {
	if (cartStore.checkedCount === 0) {
		toast.warning("请选择要删除的商品");
		return;
	}
	const success = await cartStore.batchDeleteAction();
	if (success) {
		toast.success("已删除选中商品");
	}
};

const handleCheckItem = async (id: string) => {
	await cartStore.toggleCheckedAction(id);
};

const handleCheckAll = async () => {
	await cartStore.toggleAllCheckedAction();
};

const goCheckout = () => {
	if (cartStore.checkedCount === 0) {
		toast.warning("请选择要结算的商品");
		return;
	}
	router.push({ name: "checkout" });
};

const goShopping = () => {
	router.push("/");
};
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center gap-3 mb-6">
        <ShoppingCart class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-zinc-800">我的购物车</h1>
        <Badge variant="secondary" class="ml-2">{{ cartStore.cartCount }} 件商品</Badge>
      </div>

      <!-- 购物车为空 -->
      <Card v-if="cartStore.cartList.length === 0" class="text-center py-16">
        <CardContent>
          <ShoppingBag class="w-24 h-24 mx-auto text-zinc-200 mb-6" />
          <p class="text-zinc-500 mb-6">购物车还是空的，快去选购商品吧~</p>
          <Button @click="goShopping" class="bg-blue-600 hover:bg-blue-700">
            去购物
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <!-- 购物车列表 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 商品列表 -->
        <div class="lg:col-span-2">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-12">
                    <Checkbox
                      :checked="cartStore.isAllChecked"
                      @update:checked="handleCheckAll"
                    />
                  </TableHead>
                  <TableHead>商品信息</TableHead>
                  <TableHead class="text-center w-24">单价</TableHead>
                  <TableHead class="text-center w-32">数量</TableHead>
                  <TableHead class="text-center w-24">小计</TableHead>
                  <TableHead class="w-16">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in cartStore.cartList" :key="item.id" class="group">
                  <TableCell>
                    <Checkbox
                      :checked="item.isChecked === 1"
                      @update:checked="handleCheckItem(item.id)"
                    />
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-4">
                      <router-link
                        :to="{ name: 'product-detail', params: { id: item.skuId } }"
                        class="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 shrink-0"
                      >
                        <img
                          :src="getFileUrl(item.imgUrl)"
                          :alt="item.skuName"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </router-link>
                      <div class="flex-1 min-w-0">
                        <router-link
                          :to="{ name: 'product-detail', params: { id: item.skuId } }"
                          class="font-medium text-zinc-800 hover:text-blue-600 line-clamp-2"
                        >
                          {{ item.skuName }}
                        </router-link>
                        <div class="flex gap-2 mt-2">
                          <Badge variant="outline" class="text-xs">正品保障</Badge>
                          <Badge variant="outline" class="text-xs">极速发货</Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell class="text-center">
                    <span class="text-blue-600 font-medium">¥{{ formatPrice(item.skuPrice) }}</span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        class="w-7 h-7"
                        @click="handleQuantityChange(item.id, item.skuNum - 1)"
                        :disabled="item.skuNum <= 1"
                      >
                        <Minus class="w-3 h-3" />
                      </Button>
                      <span class="w-10 text-center text-sm">{{ item.skuNum }}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        class="w-7 h-7"
                        @click="handleQuantityChange(item.id, item.skuNum + 1)"
                        :disabled="item.skuNum >= 99"
                      >
                        <Plus class="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell class="text-center">
                    <span class="text-blue-600 font-bold">
                      ¥{{ formatPrice(parseFloat(item.skuPrice.toString()) * item.skuNum) }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="text-zinc-400 hover:text-blue-600"
                      @click="handleDelete(item.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <!-- 底部操作栏 -->
          <Card class="mt-4">
            <CardContent class="flex items-center justify-between py-4">
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    :checked="cartStore.isAllChecked"
                    @update:checked="handleCheckAll"
                  />
                  <span class="text-sm">全选</span>
                </label>
                <Button
                  variant="ghost"
                  class="text-zinc-500"
                  @click="handleBatchDelete"
                  :disabled="cartStore.checkedCount === 0"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  删除选中
                </Button>
              </div>
              <div class="text-sm text-zinc-500">
                已选择 <span class="text-blue-600 font-medium">{{ cartStore.checkedCount }}</span> 件商品
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 结算面板 -->
        <div class="lg:col-span-1">
          <Card class="sticky top-4">
            <CardContent class="p-6 space-y-4">
              <h3 class="font-medium text-zinc-800">订单摘要</h3>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-zinc-500">商品金额</span>
                  <span>¥{{ (cartStore.totalPrice / 100).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">运费</span>
                  <span class="text-blue-600">免运费</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-500">优惠</span>
                  <span class="text-blue-600">-¥0.00</span>
                </div>
              </div>

              <div class="border-t pt-4">
                <div class="flex justify-between items-baseline">
                  <span class="text-zinc-500">应付总额</span>
                  <span class="text-2xl font-bold text-blue-600">
                    ¥{{ (cartStore.totalPrice / 100).toFixed(2) }}
                  </span>
                </div>
              </div>

              <Button
                class="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
                @click="goCheckout"
                :disabled="cartStore.checkedCount === 0"
              >
                去结算 ({{ cartStore.checkedCount }})
              </Button>

              <Button
                variant="outline"
                class="w-full"
                @click="goShopping"
              >
                继续购物
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>

</template>
