import request from "./request";
import type { ApiResponse } from "./types";

// 获取收藏列表
export function getCollectList() {
	return request.get("/api/collect/list");
}

// 添加收藏
export function addCollect(skuId: string | number) {
	return request.post<ApiResponse>(`/api/collect/addCollect/${skuId}`);
}

// 取消收藏
export function cancelCollect(skuId: string | number) {
	return request.get<ApiResponse>(`/api/collect/cancelCollect/${skuId}`);
}

// 批量删除收藏
export function batchDeleteCollect(ids: (string | number)[]) {
	return request.delete<ApiResponse>("/api/collect/batchDelete", { data: { ids } });
}
