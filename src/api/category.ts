import request from './request';
import type { Category, CategoryListResponse } from './types';

// 获取分类树（前台）
export function getCategoryTree() {
  return request.get<CategoryListResponse>('/api/product/category/tree');
}

// 获取基础分类列表（前台）
export function getBaseCategoryList(params?: { limit?: number }) {
  return request.get<CategoryListResponse>('/api/product/getBaseCategoryList', { params });
}

// 获取所有分类（后台）
export const getAllCategoryList = () => {
  return request.get<{ code: number; message: string; categoryList: Category[] }>('/product/AllCategoryList');
};

// 获取分类列表 (后台/通用)
export const getCategoryList = (params?: { parentId?: string }) => {
  return request.get<{ code: number; message: string; categoryList: Category[] }>('/product/categoryList', { params });
};

// 分类列表别名 (后台/通用)
export const getCategoryListAlias = (params?: { parentId?: string }) => {
  return request.get<{ code: number; message: string; categoryList: Category[] }>('/category/list', { params });
};

// 添加分类
export const createCategory = (data: { name: string; parentId?: string; sort?: number }) => {
  return request.post<{ code: number; message: string; category: Category }>('/product/category', data);
};

// 修改分类
export const updateCategory = (data: { id: string; name?: string; parentId?: string; sort?: number; showFlag?: number }) => {
  return request.put<{ code: number; message: string }>('/product/category', data);
};

// 修改是否显示
export const updateCategoryShowFlag = (categoryId: string, showFlag: number) => {
  return request.put<{ code: number; message: string }>(`/product/showFlag/${categoryId}/${showFlag}`);
};

// 删除分类
export const deleteCategory = (categoryId: string) => {
  return request.delete<{ code: number; message: string }>(`/product/category/${categoryId}`);
};
