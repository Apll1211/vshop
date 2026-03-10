import request from "./request";
import type { Advertisement, ApiResponse } from "./types";

// ==================== 前台 API ====================

// 获取轮播图广告列表
export function getFrontAdvList(limit: number = 4, advType?: string | number) {
	return request.get<{ code: number; message: string; data: Advertisement[] }>(
		`/api/advList/${limit}`,
		{ params: { advType } },
	);
}

// ==================== 后台 API ====================

// 获取广告列表
export const getAdvList = (params?: { keyword?: string; pageNo?: number; pageSize?: number }) => {
	return request.get<{
		code: number;
		message: string;
		data: Advertisement[];
		pageNo: number;
		pageSum: number;
		pageSize: number;
		total: number;
	}>("/advList", { params });
};

// 添加广告
export const createAdv = (data: {
	name: string;
	imgUrl: string;
	linkUrl?: string;
	advType?: number;
	sort?: number;
}) => {
	return request.post<ApiResponse>("/adv", data);
};

// 修改广告
export const updateAdv = (data: {
	id: string;
	name?: string;
	imgUrl?: string;
	linkUrl?: string;
	advType?: number;
	sort?: number;
}) => {
	return request.put<ApiResponse>("/adv", data);
};

// 修改广告状态
export const updateAdvStatus = (id: string, status: number | string) => {
	return request.put<ApiResponse>(`/adv/${id}/${status}`);
};

// 删除广告
export const deleteAdv = (id: string) => {
	return request.delete<ApiResponse>(`/adv/${id}`);
};
