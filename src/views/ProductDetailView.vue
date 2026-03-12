<script setup lang="ts">
import {
	ChevronRight,
	Heart,
	Minus,
	Plus,
	RotateCcw,
	Share2,
	ShieldCheck,
	ShoppingCart,
	Truck,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { addCollect, cancelCollect, getProductDetail } from "@/api";
import { getFileUrl } from "@/api/request";
import type { ProductDetail, Sku, SpuSaleAttr } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const product = ref<ProductDetail | null>(null);
const loading = ref(true);
const quantity = ref(1);
const currentImageIndex = ref(0);
const selectedAttrs = ref<Record<string, string>>({});
const isFavorite = ref(false);

const skuInfo = computed<Sku | null>(() => product.value?.skuInfo || null);
const spuSaleAttrList = computed<SpuSaleAttr[]>(() => product.value?.spuSaleAttrList || []);
const images = computed(() => {
	if (!skuInfo.value?.skuImageList || skuInfo.value.skuImageList.length === 0) {
		const defaultImg = skuInfo.value?.skuDefaultImg || skuInfo.value?.defaultImg;
		return defaultImg ? [{ imgUrl: defaultImg }] : [];
	}
	return skuInfo.value.skuImageList;
});
const currentPrice = computed(() => {
	return skuInfo.value?.price || product.value?.price || 0;
});

const formatPrice = (price: string | number) => {
	const p = typeof price === "string" ? parseFloat(price) : price;
	return (p / 100).toFixed(2);
};

onMounted(async () => {
	const id = route.params.id as string;
	if (!id) return;

	try {
		const res = (await getProductDetail(id)) as any;
		if (res) {
			// 后端返回可能在 res.data 中，拦截器已处理
			product.value = res.data || res.product || res;

			// 初始化选中属性 (兼容新旧格式)
			if (spuSaleAttrList.value.length > 0) {
				spuSaleAttrList.value.forEach((attr: any) => {
					const attrName = attr.attr || attr.saleAttrName;
					const values = attr.attrValue || attr.spuSaleAttrValueList;
					
					if (values && values.length > 0) {
						const firstVal = typeof values[0] === 'string' ? values[0] : (values[0].attrValue || values[0].saleAttrValueName);
						selectedAttrs.value[attrName] = firstVal || "";
					}
				});
			}
		}
	} catch (error) {
		toast.error("加载商品详情失败");
	} finally {
		loading.value = false;
	}
});

const selectAttr = (attrName: string, valueName: string) => {
	selectedAttrs.value[attrName] = valueName;
};

const isSelected = (attrName: string, valueName: string) => {
	return selectedAttrs.value[attrName] === valueName;
};

const increaseQty = () => {
	if (quantity.value < 99) quantity.value++;
};

const decreaseQty = () => {
	if (quantity.value > 1) quantity.value--;
};

const addToCart = async () => {
	if (!skuInfo.value) return;

	try {
		const success = await cartStore.addToCartAction(
			skuInfo.value.id || skuInfo.value._id,
			quantity.value,
		);
		if (success) {
			toast.success("已添加到购物车");
		} else {
			toast.error("添加失败，请稍后重试");
		}
	} catch (error) {
		toast.error("添加失败，请重试");
	}
};

const buyNow = async () => {
	if (!userStore.isLoggedIn) {
		toast.error("请先登录");
		router.push({ name: "login", query: { redirect: route.fullPath } });
		return;
	}

	const success = await cartStore.addToCartAction(
		skuInfo.value?.id || skuInfo.value?._id || "",
		quantity.value,
	);
	if (success) {
		router.push({ name: "checkout" });
	}
};

const toggleFavorite = async () => {
	if (!userStore.isLoggedIn) {
		toast.error("请先登录");
		return;
	}

	const id = skuInfo.value?.id || skuInfo.value?._id;
	if (!id) return;

	try {
		if (isFavorite.value) {
			await cancelCollect(id);
			isFavorite.value = false;
			toast.success("已取消收藏");
		} else {
			await addCollect(id);
			isFavorite.value = true;
			toast.success("已添加收藏");
		}
	} catch (error) {
		toast.error("操作失败");
	}
};

const shareProduct = () => {
	const name = skuInfo.value?.fullName || skuInfo.value?.name || "商品详情";
	if (navigator.share) {
		navigator.share({
			title: name,
			url: window.location.href,
		});
	} else {
		navigator.clipboard.writeText(window.location.href);
		toast.success("链接已复制到剪贴板");
	}
};

const productName = computed(() => skuInfo.value?.fullName || skuInfo.value?.name || "商品详情");
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <!-- 面包屑 -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-3">
        <nav class="flex items-center gap-2 text-sm text-zinc-500">
          <router-link to="/" class="hover:text-emerald-600">首页</router-link>
          <ChevronRight class="w-4 h-4" />
          <span class="text-zinc-800 line-clamp-1">{{ productName }}</span>
        </nav>
      </div>
    </div>

    <div v-if="loading" class="container mx-auto px-4 py-8">
      <div class="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="aspect-square bg-zinc-200 rounded-xl" />
        <div class="space-y-4">
          <div class="h-8 bg-zinc-200 rounded w-3/4" />
          <div class="h-6 bg-zinc-200 rounded w-1/2" />
          <div class="h-24 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>

    <div v-else-if="product" class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧图片区域 -->
        <div class="space-y-4">
          <!-- 主图 -->
          <Card class="overflow-hidden">
            <div class="aspect-square bg-zinc-100 relative">
              <Carousel class="w-full h-full">
                <CarouselContent>
                  <CarouselItem v-for="(img, idx) in images" :key="idx">
                    <img
                      :src="getFileUrl(img.imgUrl)"
                      :alt="productName"
                      class="w-full h-full object-cover"
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious class="left-2" v-if="images.length > 1" />
                <CarouselNext class="right-2" v-if="images.length > 1" />
              </Carousel>
            </div>
          </Card>
          <!-- 缩略图 -->
          <div class="flex gap-2 overflow-x-auto pb-2" v-if="images.length > 1">
            <button
              v-for="(img, idx) in images"
              :key="idx"
              class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
              :class="currentImageIndex === idx ? 'border-emerald-500' : 'border-transparent'"
              @click="currentImageIndex = idx"
            >
              <img :src="getFileUrl(img.imgUrl)" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- 右侧信息区域 -->
        <div class="space-y-6">
          <!-- 标题 -->
          <div>
            <h1 class="text-2xl font-bold text-zinc-800 mb-2">{{ productName }}</h1>
            <p class="text-zinc-500 line-clamp-3">{{ skuInfo?.name }}</p>
          </div>

          <!-- 价格 -->
          <Card class="bg-gradient-to-r from-rose-50 to-amber-50 border-0">
            <CardContent class="p-6">
              <div class="flex items-baseline gap-2">
                <span class="text-sm text-zinc-500">售价</span>
                <span class="text-3xl font-bold text-rose-500">¥{{ formatPrice(currentPrice) }}</span>
              </div>
              <div class="flex gap-4 mt-3">
                <Badge variant="outline" class="border-rose-400 text-rose-500">正品保障</Badge>
                <Badge variant="outline" class="border-amber-400 text-amber-500">顺丰包邮</Badge>
              </div>
            </CardContent>
          </Card>

          <!-- 属性选择 -->
          <div v-for="attr in spuSaleAttrList" :key="attr.attr || attr.saleAttrName" class="space-y-3">
            <h3 class="text-sm font-medium text-zinc-700">{{ attr.attr || attr.saleAttrName }}</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="value in (attr.attrValue || (attr as any).spuSaleAttrValueList)"
                :key="typeof value === 'string' ? value : value.saleAttrValueName"
                class="px-4 py-2 rounded-lg border-2 transition-all"
                :class="isSelected(attr.attr || attr.saleAttrName || '', 
                  typeof value === 'string' ? value : (value.attrValue || value.saleAttrValueName || ''))
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                : 'border-zinc-200 hover:border-zinc-300'"
              @click="selectAttr(attr.attr || attr.saleAttrName || '', typeof value === 'string' ? value : (value.attrValue || value.saleAttrValueName || ''))"
            >
              {{ typeof value === 'string' ? value : (value.attrValue || value.saleAttrValueName) }}
              </button>
            </div>
          </div>

          <!-- 数量选择 -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-zinc-700">数量</h3>
            <div class="flex items-center gap-4">
              <div class="flex items-center border rounded-lg">
                <button
                  class="p-2 hover:bg-zinc-100 transition-colors"
                  @click="decreaseQty"
                  :disabled="quantity <= 1"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  max="99"
                  class="w-16 text-center border-x py-2 focus:outline-none"
                />
                <button
                  class="p-2 hover:bg-zinc-100 transition-colors"
                  @click="increaseQty"
                  :disabled="quantity >= 99"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
              <span class="text-sm text-zinc-500">库存: {{ skuInfo?.stock || 0 }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-4 pt-4">
            <Button
              size="lg"
              class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              @click="addToCart"
            >
              <ShoppingCart class="w-5 h-5 mr-2" />
              加入购物车
            </Button>
            <Button
              size="lg"
              class="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              @click="buyNow"
            >
              立即购买
            </Button>
          </div>

          <!-- 收藏分享 -->
          <div class="flex gap-6 pt-2">
            <button
              class="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition-colors"
              @click="toggleFavorite"
            >
              <Heart :class="['w-5 h-5', isFavorite ? 'fill-rose-500 text-rose-500' : '']" />
              {{ isFavorite ? '已收藏' : '收藏' }}
            </button>
            <button
              class="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors"
              @click="shareProduct"
            >
              <Share2 class="w-5 h-5" />
              分享
            </button>
          </div>

          <!-- 服务保障 -->
          <div class="flex gap-6 pt-4 border-t">
            <div class="flex items-center gap-2 text-sm text-zinc-500">
              <ShieldCheck class="w-5 h-5 text-emerald-500" />
              正品保障
            </div>
            <div class="flex items-center gap-2 text-sm text-zinc-500">
              <Truck class="w-5 h-5 text-blue-500" />
              极速发货
            </div>
            <div class="flex items-center gap-2 text-sm text-zinc-500">
              <RotateCcw class="w-5 h-5 text-amber-500" />
              7天退换
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情选项卡 -->
      <Card class="mt-8">
        <Tabs default-value="description" class="w-full">
          <TabsList class="w-full justify-start border-b rounded-none px-6">
            <TabsTrigger value="description" class="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">
              商品介绍
            </TabsTrigger>
            <TabsTrigger value="specs" class="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">
              规格参数
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" class="p-6">
            <div class="prose max-w-none">
              <div class="mt-4 space-y-4">
                <img
                  v-for="(img, idx) in images"
                  :key="idx"
                  :src="getFileUrl(img.imgUrl)"
                  :alt="productName"
                  class="w-full rounded-lg"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="specs" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-zinc-50 p-4 rounded-lg">
                <dt class="text-sm text-zinc-500">商品名称</dt>
                <dd class="mt-1 font-medium">{{ productName }}</dd>
              </div>
              <div v-for="(value, key) in selectedAttrs" :key="key" class="bg-zinc-50 p-4 rounded-lg">
                <dt class="text-sm text-zinc-500">{{ key }}</dt>
                <dd class="mt-1 font-medium">{{ value }}</dd>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>

    <!-- 商品不存在 -->
    <div v-else class="container mx-auto px-4 py-16 text-center">
      <p class="text-zinc-500">商品不存在或已下架</p>
      <Button class="mt-4" @click="router.push('/')">返回首页</Button>
    </div>
  </div>
</template>
