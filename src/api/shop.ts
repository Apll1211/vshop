import request from './request';
import type { Shop, ApiResponse } from './types';

// 获取店铺列表
export const getShopList = () => {
  return request.get<{ code: number; message: string; shopList: Shop[] }>('/shopList');
};

// 创建店铺（仅商户可操作）
export const createShop = (data: FormData) => {
  return request.post<{ code: number; message: string; shop: Shop }>('/shopList', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改店铺信息（仅店铺所有者可操作）
export const updateShop = (id: string, data: FormData | Partial<Shop>) => {
  if (data instanceof FormData) {
    return request.put<{ code: number; message: string }>(`/shopList/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return request.put<{ code: number; message: string }>(`/shopList/${id}`, data);
};

// 删除店铺（仅admin可操作）
export const deleteShop = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/shopList/${id}`);
};

// 获取店铺详情
export const getShopDetail = (id: string) => {
  return request.get<{ code: number; shop: Shop }>(`/shopList/${id}`);
};
