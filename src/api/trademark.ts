import request from "./request";
import type { ApiResponse, Trademark, TrademarkListResponse } from "./types";

// 获取品牌列表 (前台/限额)
export function getFrontTrademarkList(limit: number = 6) {
	return request.get<TrademarkListResponse>(`/api/product/trademark/${limit}`);
}

// 分页获取品牌列表 (前台/分页)
export function getFrontTrademarkListPage(params: { pageNo?: number; pageSize?: number }) {
	return request.get<TrademarkListResponse>("/api/product/trademark/list", { params });
}

// 分页获取品牌列表 (后台)
export const getTrademarkList = (params?: {
	keyword?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<TrademarkListResponse>("/product/trademarkList", { params });
};

// 获取所有品牌 (后台展示)
export const getAllTrademark = () => {
	return request.get<TrademarkListResponse>("/product/allTrademark");
};

// 添加品牌
export const createTrademark = (data: FormData) => {
	return request.post<ApiResponse>(`/product/trademark`, data, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

// 修改品牌
export const updateTrademark = (data: FormData) => {
	return request.put<ApiResponse>(`/product/trademark`, data, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

// 根据ID获取品牌信息
export const getTrademarkById = (id: string) => {
	return request.get<ApiResponse<Trademark>>(`/product/trademark/${id}`);
};

// 修改是否显示
export const updateTrademarkShowFlag = (id: string, showFlag: number) => {
	return request.put<ApiResponse>(`/product/trademark/${id}/${showFlag}`);
};

// 删除品牌
export const deleteTrademark = (id: string) => {
	return request.delete<ApiResponse>(`/product/trademark/${id}`);
};

// 批量删除品牌
export const batchDeleteTrademark = (ids: string[]) => {
	return request.delete<ApiResponse>("/product/trademarkBatchRemove", { data: ids });
};
