import request from './request'
import type { UserRegisterParams, UserLoginParams, UserInfo, UserAddress, ApiResponse } from './types'

// 用户注册
export function register(data: UserRegisterParams) {
  return request.post<ApiResponse<UserInfo>>('/api/user/passport/register', data)
}

// 用户密码登录
export function login(data: UserLoginParams) {
  return request.post<ApiResponse<UserInfo>>('/api/user/passport/login', data)
}

// 用户登出
export function logout() {
  return request.get<ApiResponse>('/api/user/passport/logout')
}

// 短信登录
export function smsLogin(data: { phone: string; code: string }) {
  return request.post<ApiResponse<UserInfo>>('/api/user/login', data)
}

// 修改密码
export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return request.put<ApiResponse>('/api/user/upPassword', data)
}

// 获取用户信息
export function getUserInfo() {
  return request.get<ApiResponse<UserInfo>>('/api/user/passport/auth/getUserInfo')
}

// 上传头像
export function uploadAvatar(formData: FormData) {
  return request.post<ApiResponse<{ url: string }>>('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 添加地址
export function addAddress(data: Omit<UserAddress, 'id' | 'userId'>) {
  return request.post<ApiResponse<UserAddress>>('/api/user/userAddress', data)
}

// 修改地址
export function updateAddress(id: string, data: Partial<UserAddress>) {
  return request.put<ApiResponse<UserAddress>>(`/api/user/userAddress/${id}`, data)
}

// 删除地址
export function deleteAddress(id: string) {
  return request.delete<ApiResponse>(`/api/user/userAddress/${id}`)
}

// 设置默认地址
export function setDefaultAddress(id: string) {
  return request.put<ApiResponse>(`/api/user/upUserDefaultAddressList/${id}`)
}
