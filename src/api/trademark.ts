import request from './request';
import type { Trademark, TrademarkListResponse } from './types';

// 获取品牌列表 (前台/限额)
export function getFrontTrademarkList(limit: number = 6) {
  return request.get<TrademarkListResponse>(`/api/product/trademark/${limit}`);
}

// 获取品牌列表 (前台/分页)
export function getFrontTrademarkListPage(params: { pageNo?: number; pageSize?: number }) {
  return request.get<TrademarkListResponse>('/api/product/trademark/list', { params });
}

// 获取品牌列表（后台）
export const getTrademarkList = (params?: { keyword?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<TrademarkListResponse>('/product/trademark', { params });
};

// 获取品牌列表别名（后台）
export const getTrademarkListAlias = (params?: { keyword?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<TrademarkListResponse>('/product/trademarkList', { params });
};

// 获取所有品牌
export const getAllTrademark = () => {
  return request.get<{ code: number; message: string; trademarkList: Trademark[] }>('/product/allTrademark');
};

// 添加品牌
export const createTrademark = (data: FormData) => {
  return request.post<{ code: number; message: string; trademarkId: string; logoUrl?: string }>('/product/trademark', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改品牌
export const updateTrademark = (data: FormData) => {
  return request.put<{ code: number; message: string; logoUrl?: string }>('/product/trademark', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 根据ID获取品牌信息
export const getTrademarkById = (id: string) => {
  return request.get<{ code: number; message: string; info: Trademark }>(`/product/trademark/${id}`);
};

// 修改是否显示
export const updateTrademarkShowFlag = (id: string, showFlag: number) => {
  return request.put<{ code: number; message: string }>(`/product/trademark/${id}/${showFlag}`);
};

// 删除品牌
export const deleteTrademark = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/trademark/${id}`);
};

// 批量删除品牌
export const batchDeleteTrademark = (ids: string[]) => {
  return request.delete<{ code: number; message: string }>('/product/trademarkBatchRemove', { data: ids });
};
