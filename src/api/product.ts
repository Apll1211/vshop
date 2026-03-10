import request from './request';
import type { Spu, Sku, SpuSaleAttr, ProductDetail } from './types';

// ==================== SPU API ====================

// 获取SPU列表 (前台)
export const getFrontSpuList = (params?: { category1Id?: string; category2Id?: string; category3Id?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; spuList: Spu[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/api/product/spu/list', { params });
};

// 获取SPU列表 (后台)
export const getSpuList = (params?: { shopId?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; spuList: Spu[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/spuList', { params });
};

// 根据分类获取SPU列表 (后台)
export const getAllSpuListByCategory = (categoryId: string, params?: { shopId?: string }) => {
  return request.get<{ code: number; message: string; spuList: Spu[] }>(`/product/allSpuList/${categoryId}`, { params });
};

// 根据ID获取SPU信息
export const getSpuDetail = (id: string) => {
  return request.get<{ code: number; message: string; info: Spu }>(`/product/spu/${id}`);
};

// 添加SPU（仅商户可操作）
export const createSpu = (data: FormData) => {
  return request.post<{ code: number; message: string; spuId: string; imageUrls?: string[] }>('/product/spu', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改SPU（仅商户可操作）
export const updateSpu = (data: FormData) => {
  return request.put<{ code: number; message: string; imageUrls?: string[] }>('/product/spu', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 删除SPU（仅商户可操作）
export const deleteSpu = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/spu/${id}`);
};

// 获取SPU销售属性
export const getSpuSaleAttrList = (spuId: string) => {
  return request.get<{ code: number; message: string; spuSaleAttrList: SpuSaleAttr[] }>('/product/spuSaleAttrList', { params: { spuId } });
};

// ==================== SKU API ====================

// 获取SKU详情 (前台)
export function getProductDetail(id: string) {
  return request.get<ProductDetail>(`/api/product/item/${id}`);
}

// 获取热门商品 (前台)
export function getTopProducts(type: string | number, limit: number = 4) {
  return request.get<{ code: number; message: string; skuList: Sku[] }>(`/api/product/top/${type}`, { params: { limit } });
}

// 获取SKU列表 (后台)
export const getSkuList = (params?: { spuId?: string; category1Id?: string; category2Id?: string; category3Id?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; skuList: Sku[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/skuList', { params });
};

// 根据ID获取SKU信息 (后台)
export const getSkuDetail = (id: string) => {
  return request.get<{ code: number; skuInfo: Sku }>(`/product/sku/${id}`);
};

// 添加SKU
export const createSku = (data: FormData | any) => {
  if (data instanceof FormData) {
    return request.post<{ code: number; message: string; skuId: string; imageUrls?: string[] }>('/product/sku', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return request.post<{ code: number; message: string }>('/product/sku', data);
};

// 修改SKU
export const updateSku = (data: FormData | any) => {
  if (data instanceof FormData) {
    return request.put<{ code: number; message: string; imageUrls?: string[] }>('/product/sku', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return request.put<{ code: number; message: string }>('/product/sku', data);
};

// 删除SKU
export const deleteSku = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/sku/${id}`);
};

// 修改是否上架
export const toggleSkuSale = (id: string, isSale: number | string) => {
  return request.put<{ code: number; message: string }>(`/product/sku/${id}/${isSale}`);
};

// ==================== 属性 API ====================

// 获取属性列表 (前台)
export function getFrontAttrList(category1Id: string, category2Id: string, category3Id: string) {
  return request.get(`/api/product/attr/list/${category1Id}/${category2Id}/${category3Id}`);
}

// 获取属性列表 (后台)
export const getAttrList = (params?: { category1Id?: string; category2Id?: string; category3Id?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; attrList: any[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/attr', { params });
};

// 添加属性
export const createAttr = (data: { name: string; categoryId: string; valueList: any[] }) => {
  return request.post<{ code: number; message: string }>('/product/attr', data);
};

// 修改属性
export const updateAttr = (data: { id: string; name: string; categoryId: string; valueList: any[] }) => {
  return request.put<{ code: number; message: string }>('/product/attr', data);
};

// 根据分类获取属性
export const getAttrByCategoryId = (categoryId: string) => {
  return request.get<{ code: number; data: any[] }>(`/product/attr/${categoryId}`);
};

// 删除属性
export const deleteAttr = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/attr/${id}`);
};

// ==================== 搜索 API ====================

export interface SearchParams {
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
  trademark?: string;
  order?: string;
}

export function searchProducts(params: SearchParams) {
  return request.get<{ code: number; data: any[]; total: number }>('/api/product/search', { params });
}
