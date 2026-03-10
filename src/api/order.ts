import request from "./request";
import type { ApiResponse, Order, OrderListResponse, SubmitOrderParams } from "./types";

// ==================== 用户订单 API ====================

// 获取交易页信息 (下单前获取地址和购物车商品信息)
export function getTradeInfo() {
	return request.get<ApiResponse>("/api/order/auth/trade");
}

// 提交订单
export function submitOrder(data: SubmitOrderParams) {
	return request.post<ApiResponse<string>>("/api/order/auth/submitOrder", data);
}

// 获取我的订单
export function getMyOrderList(pageNo: number = 1, pageSize: number = 10, status?: string) {
	return request.get<OrderListResponse>(`/api/order/auth/${pageNo}/${pageSize}`, {
		params: { status },
	});
}

// 获取订单详情
export function getOrderDetail(orderId: string) {
	return request.get<ApiResponse<Order>>(`/api/order/auth/detail/${orderId}`);
}

// 取消订单
export function cancelOrder(orderId: string) {
	return request.put<ApiResponse>(`/api/order/auth/cancel/${orderId}`);
}

// 删除订单
export function deleteOrder(id: string) {
	return request.delete<ApiResponse>(`/api/order/deleteAuth/${id}`);
}

// ==================== 支付 API ====================

// 获取支付信息 (微信支付二维码)
export function getPayInfo(orderId: string) {
	return request.get<ApiResponse<string>>(`/api/payment/weixin/createNative/${orderId}`);
}

// 查询支付状态
export function queryPayStatus(orderId: string) {
	return request.get<ApiResponse>(`/api/payment/weixin/queryPayStatus/${orderId}`);
}

// 支付订单 (通用支付接口)
export function payOrder(orderId: string, paymentMethod: number = 1) {
	return request.post<ApiResponse<{ payUrl: string }>>(
		`/api/order/auth/pay/${orderId}/${paymentMethod}`,
	);
}

// ==================== 后台管理 API ====================

// 获取订单列表 (后台)
export const getAdminOrderList = (params?: {
	tradeNo?: string;
	consignee?: string;
	status?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<{
		code: number;
		message: string;
		orderList: Order[];
		pageNo: number;
		pageSum: number;
		pageSize: number;
		count: number;
	}>("/order/list", { params });
};
