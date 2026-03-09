import request from "./request";
import type { ApiResponse, CartItem, CartListResponse } from "./types";

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
	return request.post<ApiResponse>("/api/cart/batchDeleteCart", { ids });
}

// 更新购物车商品数量
export function updateCartNum(id: string, skuNum: number) {
	return request.put<ApiResponse>(`/api/cart/updateCartNum/${id}/${skuNum}`);
}

// 切换商品选中状态
export function toggleCartChecked(id: string, isChecked: number) {
	return request.put<ApiResponse>(`/api/cart/toggleChecked/${id}/${isChecked}`);
}

// 全选/取消全选
export function toggleAllChecked(isChecked: number) {
	return request.put<ApiResponse>(`/api/cart/toggleAllChecked/${isChecked}`);
}
