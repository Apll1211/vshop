import request from "./request";
import type { ApiResponse, PagedResponse, ProductDetail, Sku, SkuAttrValue, Spu } from "./types";

// ==================== SPU API ====================

/**
 * 获取SPU列表 (前台/后台通用分页)
 */
export const getSpuList = (params?: {
	shopId?: string;
	category1Id?: string;
	category2Id?: string;
	categoryId?: string;
	name?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<PagedResponse<Spu>>("/product/spuList", { params });
};

/**
 * 根据ID获取SPU详情
 */
export const getSpuDetail = (id: string) => {
	return request.get<ApiResponse<Spu>>(`/product/spu/${id}`);
};

/**
 * 添加/修改 SPU
 */
export const saveSpu = (data: FormData | any) => {
	const isFormData = data instanceof FormData;
	const id = isFormData ? data.get("id") : data.id;
	const method = id ? "put" : "post";
	const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
	return request[method]<ApiResponse>("/product/spu", data, config);
};

/**
 * 删除SPU
 */
export const deleteSpu = (id: string) => {
	return request.delete<ApiResponse>(`/product/spu/${id}`);
};

// ==================== SKU API ====================

/**
 * 获取SKU详情 (前台项目)
 */
export function getProductDetail(id: string) {
	return request.get<ProductDetail>(`/api/product/item/${id}`);
}

/**
 * 获取热门商品 (前台项目)
 */
export function getTopProducts(type: string | number, limit = 4) {
	return request.get<{ code: number; skuList: Sku[] }>(`/api/product/top/${type}`, {
		params: { limit },
	});
}

/**
 * 获取SKU列表 (后台项目，分页)
 */
export const getSkuList = (params?: {
	spuId?: string;
	category1Id?: string;
	category2Id?: string;
	categoryId?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<PagedResponse<Sku>>("/product/skuList", { params });
};

/**
 * 添加/修改 SKU
 */
export const saveSku = (data: any) => {
	const isFormData = data instanceof FormData;
	const id = isFormData ? data.get("id") : data.id;
	const method = id ? "put" : "post";
	const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
	return request[method]<ApiResponse>("/product/sku", data, config);
};

/**
 * 删除SKU
 */
export const deleteSku = (id: string) => {
	return request.delete<ApiResponse>(`/product/sku/${id}`);
};

/**
 * 修改 SKU 上下架状态
 */
export const toggleSkuSale = (id: string, isSale: number | string) => {
	return request.put<ApiResponse>(`/product/sku/${id}/${isSale}`);
};

// ==================== 属性 API ====================

/**
 * 获取属性列表 (支持分类筛选)
 */
export const getAttrList = (params?: {
	category1Id?: string;
	category2Id?: string;
	categoryId?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<PagedResponse<any>>("/product/attr", { params });
};

/**
 * 保存属性 (添加/修改)
 * @param data attrValueList 现在是 string[] 格式
 */
export const saveAttr = (data: {
	id?: string;
	name: string;
	categoryId: string;
	category1Id?: string;
	category2Id?: string;
	attrValueList: string[];
}) => {
	const method = data.id ? "put" : "post";
	return request[method]<ApiResponse>("/product/attr", data);
};

/**
 * 删除属性
 */
export const deleteAttr = (id: string) => {
	return request.delete<ApiResponse>(`/product/attr/${id}`);
};

// ==================== 搜索 API ====================

export interface SearchParams {
	keyword?: string;
	pageNo?: number;
	pageSize?: number;
	trademark?: string;
	order?: string;
}

/**
 * 搜索商品 (前台项目)
 */
export function searchProducts(params: SearchParams) {
	return request.get<ApiResponse<any[]>>("/api/product/search", {
		params,
	});
}
