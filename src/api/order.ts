import request from './request'
import type { OrderListResponse, SubmitOrderParams, ApiResponse, UserAddress } from './types'

// 提交订单
export function submitOrder(data: SubmitOrderParams) {
  return request.post<ApiResponse<{ orderId: string }>>('/api/order/auth/submitOrder', data)
}

// 获取订单列表
export function getOrderList(pageNo: number = 1, pageSize: number = 10) {
  return request.get<OrderListResponse>(`/api/order/auth/${pageNo}/${pageSize}`)
}

// 获取订单详情
export function getOrderDetail(orderId: string) {
  return request.get(`/api/order/auth/detail/${orderId}`)
}

// 取消订单
export function cancelOrder(orderId: string) {
  return request.put(`/api/order/auth/cancel/${orderId}`)
}

// 获取支付信息（微信支付二维码）
export function getPayInfo(orderId: string) {
  return request.get<ApiResponse<{ codeUrl: string; orderId: string; totalAmount: string }>>(
    `/api/payment/weixin/createNative/${orderId}`,
  )
}

// 查询支付状态
export function queryPayStatus(orderId: string) {
  return request.get<ApiResponse<{ tradeState: string; transactionId?: string }>>(
    `/api/payment/weixin/queryPayStatus/${orderId}`,
  )
}

// 获取用户地址列表
export function getAddressList() {
  return request.get<ApiResponse<UserAddress[]>>('/api/user/userAddress/auth/findUserAddressList')
}

// 支付订单
export function payOrder(orderId: string, paymentMethod: number = 1) {
  return request.post<ApiResponse<{ payUrl: string }>>(`/api/order/auth/pay/${orderId}/${paymentMethod}`)
}
