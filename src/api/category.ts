import request from "./request";
import type { ApiResponse, Category, CategoryListResponse } from "./types";

// 获取分类树 (前台展示)
export function getCategoryTree() {
	return request.get<CategoryListResponse>("/api/product/category/tree");
}

// 获取基础分类列表 (前台)
export function getBaseCategoryList(params?: { limit?: number }) {
	return request.get<CategoryListResponse>("/api/product/getBaseCategoryList", { params });
}

// 获取全部分类 (后台列表)
export const getAllCategoryList = () => {
	return request.get<CategoryListResponse>("/product/AllCategoryList");
};

// 获取分类列表 (分页/条件)
export const getCategoryList = (params?: { parentId?: string; pageNo?: number; pageSize?: number }) => {
	return request.get<CategoryListResponse>("/product/categoryList", { params });
}

// 添加分类
export const createCategory = (data: { name: string; parentId?: string; sort?: number }) => {
	return request.post<ApiResponse<Category>>("/product/category", data);
};

// 修改分类
export const updateCategory = (data: {
	id: string;
	name?: string;
	parentId?: string;
	sort?: number;
	showFlag?: number;
}) => {
	return request.put<ApiResponse>("/product/category", data);
};

// 修改是否显示
export const updateCategoryShowFlag = (categoryId: string, showFlag: number) => {
	return request.put<ApiResponse>(`/product/showFlag/${categoryId}/${showFlag}`);
};

// 删除分类
export const deleteCategory = (categoryId: string) => {
	return request.delete<ApiResponse>(`/product/category/${categoryId}`);
};
