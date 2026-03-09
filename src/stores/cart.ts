import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	addToCart,
	batchDeleteCart,
	deleteCartItem,
	getCartList,
	toggleAllChecked,
	toggleCartChecked,
	updateCartNum,
} from "@/api";
import type { CartItem } from "@/api/types";

export const useCartStore = defineStore(
	"cart",
	() => {
		// 状态
		const cartList = ref<CartItem[]>([]);
		const loading = ref(false);

		// 计算属性
		const cartCount = computed(() => cartList.value.length);
		const checkedCartList = computed(() =>
			cartList.value.filter((item) => item.isChecked === 1),
		);
		const checkedCount = computed(() => checkedCartList.value.length);
		const isAllChecked = computed(
			() =>
				cartList.value.length > 0 &&
				cartList.value.every((item) => item.isChecked === 1),
		);
		const totalPrice = computed(() => {
			return checkedCartList.value.reduce((sum, item) => {
				return sum + parseFloat(item.skuPrice) * item.skuNum;
			}, 0);
		});
		const selectedIds = computed(() =>
			checkedCartList.value.map((item) => item.id),
		);

		// 获取购物车列表
		async function getCartListAction() {
			loading.value = true;
			try {
				const res = (await getCartList()) as any;
				cartList.value = res.data || [];
				return cartList.value;
			} catch (error) {
				console.error("获取购物车失败:", error);
				return [];
			} finally {
				loading.value = false;
			}
		}

		// 加入购物车
		async function addToCartAction(skuId: string, buyNum: number = 1) {
			try {
				await addToCart(skuId, buyNum);
				await getCartListAction();
				return true;
			} catch (error) {
				console.error("加入购物车失败:", error);
				return false;
			}
		}

		// 删除购物车商品
		async function deleteCartItemAction(id: string) {
			try {
				await deleteCartItem(id);
				cartList.value = cartList.value.filter((item) => item.id !== id);
				return true;
			} catch (error) {
				console.error("删除商品失败:", error);
				return false;
			}
		}

		// 批量删除
		async function batchDeleteAction() {
			if (selectedIds.value.length === 0) return false;
			try {
				await batchDeleteCart(selectedIds.value);
				await getCartListAction();
				return true;
			} catch (error) {
				console.error("批量删除失败:", error);
				return false;
			}
		}

		// 更新商品数量
		async function updateCartNumAction(id: string, skuNum: number) {
			try {
				await updateCartNum(id, skuNum);
				const item = cartList.value.find((i) => i.id === id);
				if (item) {
					item.skuNum = skuNum;
				}
				return true;
			} catch (error) {
				console.error("更新数量失败:", error);
				return false;
			}
		}

		// 切换商品选中状态
		async function toggleCheckedAction(id: string) {
			const item = cartList.value.find((i) => i.id === id);
			if (!item) return false;
			try {
				const newChecked = item.isChecked === 1 ? 0 : 1;
				await toggleCartChecked(id, newChecked);
				item.isChecked = newChecked;
				return true;
			} catch (error) {
				console.error("切换选中状态失败:", error);
				return false;
			}
		}

		// 全选/取消全选
		async function toggleAllCheckedAction() {
			try {
				const newChecked = isAllChecked.value ? 0 : 1;
				await toggleAllChecked(newChecked);
				cartList.value.forEach((item) => {
					item.isChecked = newChecked;
				});
				return true;
			} catch (error) {
				console.error("全选操作失败:", error);
				return false;
			}
		}

		return {
			cartList,
			loading,
			cartCount,
			checkedCartList,
			checkedCount,
			isAllChecked,
			totalPrice,
			selectedIds,
			getCartListAction,
			addToCartAction,
			deleteCartItemAction,
			batchDeleteAction,
			updateCartNumAction,
			toggleCheckedAction,
			toggleAllCheckedAction,
		};
	},
	{
		persist: {
			key: "vshop-cart",
			storage: localStorage,
			pick: ["cartList"],
		},
	},
);
