import request from "./request";
import type { ApiResponse, Shop } from "./types";

// 获取店铺列表
export const getShopList = (params?: {
	pageNo?: number;
	pageSize?: number;
	name?: string;
}) => {
	return request.get<{ code: number; shopList: Shop[]; count?: number }>("/shopList", { params });
};

// 获取店铺详情
export const getShopDetail = (id: string) => {
	return request.get<ApiResponse<Shop>>(`/shopList/${id}`);
};

// 保存店铺 (添加/修改)
export const saveShop = (data: FormData | any) => {
	const isFormData = data instanceof FormData;
	const id = isFormData ? data.get("id") : data.id;
	const method = id ? "put" : "post";
	const url = id ? `/shopList/${id}` : "/shopList";
	const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
	return request[method]<ApiResponse>(url, data, config);
};

// 删除店铺 (仅admin可操作)
export const deleteShop = (id: string) => {
	return request.delete<ApiResponse>(`/shopList/${id}`);
};
