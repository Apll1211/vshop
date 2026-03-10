import request from './request';
import type { AdminUser, AdminLog, ApiResponse } from './types';

// ==================== 管理员认证 API ====================

export interface AdminLoginParams {
  adminName: string;
  password: string;
}

export interface AdminLoginResponse {
  code: number;
  message: string;
  token: string;
}

// 管理员登录
export const adminLogin = (data: AdminLoginParams) => {
  return request.post<AdminLoginResponse>('/admin/login', data);
};

// 获取当前管理员信息
export const getAdminInfo = () => {
  return request.get<{ code: number; message: string; info: AdminUser }>('/adminList/info');
};

// 退出登录
export const adminLogout = () => {
  return request.get<ApiResponse>('/adminList/outLogin');
};

// ==================== 管理员列表/管理 API ====================

// 获取管理员列表
export const getAdminList = () => {
  return request.get<{ code: number; message: string; adminList: AdminUser[] }>('/adminList');
};

// 添加管理员
export const createAdmin = (data: { adminName: string; password?: string; nickName?: string; avatar?: string; role: string }) => {
  return request.post<ApiResponse>('/adminList', data);
};

// 修改当前管理员信息
export const updateAdminSelf = (data: FormData) => {
  return request.put<ApiResponse>('/adminList/upInfo', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改密码
export const updateAdminPassword = (data: { oldPassword: string; password: string }) => {
  return request.put<ApiResponse>('/adminList/upPassword', data);
};

// 删除管理员
export const deleteAdmin = (id: string) => {
  return request.delete<ApiResponse>(`/adminList/${id}`);
};

// 根据ID修改管理员信息
export const updateAdmin = (id: string, data: { nickName?: string; password?: string; avatar?: string; role?: string }) => {
  return request.put<ApiResponse>(`/adminList/${id}`, data);
};

// 申请成为商户
export const becomeMerchant = () => {
  return request.put<ApiResponse>('/adminList/becomeMerchant');
};

// ==================== 管理员日志 API ====================

// 获取日志列表
export const getAdminLogList = (params?: { adminName?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; attrList: AdminLog[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/adminLog', { params });
};

// 删除日志
export const deleteAdminLog = (id: string) => {
  return request.delete<ApiResponse>(`/adminLog/${id}`);
};

// ==================== 统计 API ====================

// 获取统计数据
export const getDashboardStats = () => {
  return request.get<any>('/admin/dashboard/stats');
};
