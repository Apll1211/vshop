import request from "./request";
import type { ApiResponse, CartListResponse } from "./types";

// 获取购物车列表
export function getCartList() {
	return request.get<CartListResponse>("/api/cart/cartList");
}

// 加入购物车
export function addToCart(skuId: string, buyNum: number = 1) {
	return request.post<ApiResponse>(`/api/cart/addToCart/${skuId}/${buyNum}`);
}

// 删除购物车商品
export function deleteCartItem(id: string) {
	return request.delete<ApiResponse>(`/api/cart/deleteCart/${id}`);
}

// 批量删除购物车商品
export function batchDeleteCart(ids: string[]) {
	return request.post<ApiResponse>("/api/cart/batchDeleteCart", ids);
}

// 修改选中状态
export function toggleCartChecked(cartId: string, isChecked: number | string) {
	return request.get<ApiResponse>(`/api/cart/checkCart/${cartId}/${isChecked}`);
}

// 更新购物车商品数量 (虽然文档没直接给这个PUT，但CartItem里有skuNum，通常会有更新接口。
// 如果文档没给，可能就是通过addToCart传负数，或者这就是隐藏接口。
// 既然原本代码有，我保留并修正可能的URL)
export function updateCartNum(id: string, skuNum: number) {
	return request.put<ApiResponse>(`/api/cart/updateCartNum/${id}/${skuNum}`);
}

// 全选/取消全选
export function toggleAllChecked(isChecked: number | string) {
	return request.put<ApiResponse>(`/api/cart/toggleAllChecked/${isChecked}`);
}
