import request from './request';
import type { UserRegisterParams, UserLoginParams, UserInfo, UserAddress, ApiResponse } from './types';

// ==================== 用户认证 API ====================

// 检查手机号是否存在
export function checkPhoneExists(phone: string) {
  return request.get<{ code: number; isHas: boolean; message: string }>(`/api/user/${phone}`);
}

// 发送验证码
export function sendCode(phone: string) {
  return request.get<ApiResponse<string>>(`/api/user/passport/sendCode/${phone}`);
}

// 用户注册
export function register(data: UserRegisterParams) {
  return request.post<ApiResponse<UserInfo>>('/api/user/passport/register', data);
}

// 用户密码登录
export function login(data: UserLoginParams) {
  return request.post<ApiResponse<UserInfo>>('/api/user/passport/login', data);
}

// 短信登录
export function smsLogin(data: { phone: string; code: string }) {
  return request.post<ApiResponse<UserInfo>>('/api/user/login', data);
}

// 用户登出
export function logout() {
  return request.get<ApiResponse>('/api/user/passport/logout');
}

// 获取用户信息
export function getUserInfo() {
  return request.get<ApiResponse<UserInfo>>('/api/user/passport/auth/getUserInfo');
}

// 修改密码
export function updatePassword(data: { oldPassword: string; password: string }) {
  return request.put<ApiResponse>('/api/user/upPassword', data);
}

// 修改用户昵称
export function updateNickname(nickName: string) {
  return request.put<ApiResponse>('/api/user/info', { nickName });
}

// 上传用户头像
export function uploadAvatar(formData: FormData) {
  return request.post<{ code: number; message: string; avatar: string }>('/api/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ==================== 用户地址 API ====================

// 获取用户地址列表
export function getAddressList() {
  return request.get<ApiResponse<UserAddress[]>>('/api/user/userAddress/auth/findUserAddressList');
}

// 添加用户地址
export function addAddress(data: Partial<UserAddress>) {
  return request.post<ApiResponse>('/api/user/userAddress', data);
}

// 修改用户地址
export function updateAddress(id: string, data: Partial<UserAddress>) {
  return request.put<ApiResponse>(`/api/user/userAddress/${id}`, data);
}

// 删除用户地址
export function deleteAddress(id: string) {
  return request.delete<ApiResponse>(`/api/user/userAddress/${id}`);
}

// 设置默认地址
export function setDefaultAddress(id: string) {
  return request.put<ApiResponse>(`/api/user/upUserDefaultAddressList/${id}`);
}

// ==================== 浏览历史 API ====================

// 获取浏览历史
export function getHistory(params?: { pageNo?: number; pageSize?: number }) {
  return request.get<{ code: number; message: string; historyList: any[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/api/user/sku/history', { params });
}

// 删除浏览历史
export function deleteHistory(id: string) {
  return request.delete<{ ok: number; message: string }>(`/api/user/sku/history/${id}`);
}

// ==================== 后台管理 API ====================

// 获取用户列表 (后台)
export function getAdminUserList(params?: { keyword?: string; pageNo?: number; pageSize?: number }) {
  return request.get<{ ok: number; message: string; userList: UserInfo[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/user/list', { params });
}

// 修改用户状态 (后台)
export function updateUserStatus(id: string, status: number | string) {
  return request.put<ApiResponse>(`/user/list/${id}/${status}`);
}

// ==================== 其他 API ====================

// 获取热门搜索标签
export function getHotTags(limit: number = 10) {
  return request.get<{ code: number; message: string; keywords: string[] }>(`/api/user/hotTag/${limit}`);
}
