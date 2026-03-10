import request from "./request";
import type {
	AdminLog,
	AdminLoginParams,
	AdminLoginResponse,
	AdminUser,
	ApiResponse,
} from "./types";

// ==================== 管理员认证 API ====================

// 管理员登录
export const adminLogin = (data: AdminLoginParams) => {
	return request.post<AdminLoginResponse>("/admin/login", data);
};

// 获取当前管理员信息
export const getAdminInfo = () => {
	return request.get<ApiResponse<AdminUser>>("/adminList/info");
};

// 退出登录
export const adminLogout = () => {
	return request.get<ApiResponse>("/adminList/outLogin");
};

// ==================== 管理员管理 API ====================

// 获取管理员列表
export const getAdminList = () => {
	return request.get<{ code: number; adminList: AdminUser[] }>("/adminList");
};

// 保存管理员 (添加/修改)
export const saveAdmin = (data: any) => {
	const isFormData = data instanceof FormData;
	const id = isFormData ? data.get("id") : data.id;
	const method = id ? "put" : "post";
	const url = id ? `/adminList/${id}` : "/adminList";
	const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
	return request[method]<ApiResponse>(url, data, config);
};

// 修改当前管理员信息 (专用)
export const updateAdminSelf = (data: FormData) => {
	return request.put<ApiResponse>("/adminList/upInfo", data, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

// 修改密码
export const updateAdminPassword = (data: { oldPassword: string; password: string }) => {
	return request.put<ApiResponse>("/adminList/upPassword", data);
};

// 删除管理员
export const deleteAdmin = (id: string) => {
	return request.delete<ApiResponse>(`/adminList/${id}`);
};

// 申请成为商户
export const becomeMerchant = () => {
	return request.put<ApiResponse>("/adminList/becomeMerchant");
};

// ==================== 管理员日志 API ====================

// 获取日志列表
export const getAdminLogList = (params?: {
	adminName?: string;
	pageNo?: number;
	pageSize?: number;
}) => {
	return request.get<{
		code: number;
		logList: AdminLog[];
		pageNo: number;
		pageSum: number;
		count: number;
	}>("/adminLog", { params });
};

// 删除日志
export const deleteAdminLog = (id: string) => {
	return request.delete<ApiResponse>(`/adminLog/${id}`);
};

// ==================== 统计 API ====================

// 获取统计数据
export const getDashboardStats = () => {
	return request.get<any>("/admin/dashboard/stats");
};
