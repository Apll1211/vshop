import request from './request';
import type { ApiResponse } from './types';

// ==================== 类型定义 ====================

export interface AdminUser {
  _id: string;
  adminName: string;
  nickName?: string;
  avatar?: string;
  role: 'admin' | 'merchant';
  isMerchant?: number;
  createTime: string;
  updateTime: string;
}

export interface AdminLoginParams {
  adminName: string;
  password: string;
}

// 登录响应: { code: 200, message: "登陆成功", token: "xxx" }
export interface AdminLoginResponse {
  code: number;
  message: string;
  token: string;
}

// 获取管理员信息响应: { code: 200, info: {} }
export interface AdminInfoResponse {
  code: number;
  message: string;
  info: AdminUser;
}

export interface AdminLog {
  _id: string;
  adminId: string;
  adminName: string;
  operation: string;
  ip: string;
  createTime: string;
}

export interface Category {
  _id: string;
  name: string;
  parentId?: string;
  level?: number;
  showFlag: number;
  sort: number;
  children?: Category[];
  createTime: string;
  updateTime: string;
}

export interface Trademark {
  _id: string;
  name: string;
  logo: string;
  sort: number;
  showFlag: number;
  createTime: string;
  updateTime: string;
}

export interface SpuSaleAttr {
  _id: string;
  name: string;
  valueList: { _id: string; name: string }[];
}

export interface Spu {
  _id: string;
  name: string;
  description?: string;
  trademarkId?: string;
  shopId?: string;
  category1Id?: string;
  category2Id?: string;
  categoryId?: string;
  images: string[];
  spuSaleAttrList?: SpuSaleAttr[];
  showFlag: number;
  sort: number;
  createTime: string;
  updateTime: string;
}

export interface Sku {
  _id: string;
  spuId: string;
  name: string;
  fullName?: string;
  price: number;
  defaultImg?: string;
  stock?: number;
  isSale: number;
  createTime: string;
  updateTime: string;
}

export interface Advertisement {
  _id: string;
  name: string;
  imgUrl: string;
  linkUrl?: string;
  advType: number;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface Shop {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  adminId?: string;
  status: number;
  createTime: string;
  updateTime: string;
}

// ==================== 管理员 API ====================

// 管理员登录 - 响应: { code: 200, message: "登陆成功", token: "xxx" }
export const adminLogin = (data: AdminLoginParams) => {
  return request.post<AdminLoginResponse>('/admin/login', data);
};

// 获取管理员列表 - 响应: { code: 200, adminList: [] }
export const getAdminList = () => {
  return request.get<{ code: number; message: string; adminList: AdminUser[] }>('/adminList');
};

// 添加管理员（仅admin可操作）
export const createAdmin = (data: { adminName: string; nickName?: string; avatar?: string; role: string }) => {
  return request.post<ApiResponse<null>>('/adminList', data);
};

// 获取当前管理员信息 - 响应: { code: 200, info: {} }
export const getAdminInfo = () => {
  return request.get<AdminInfoResponse>('/adminList/info');
};

// 修改当前管理员信息
export const updateAdminSelf = (data: FormData) => {
  return request.put<ApiResponse<null>>('/adminList/upInfo', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改密码
export const updateAdminPassword = (data: { oldPassword: string; password: string }) => {
  return request.put<ApiResponse<null>>('/adminList/upPassword', data);
};

// 删除管理员（仅admin可操作）
export const deleteAdmin = (id: string) => {
  return request.delete<ApiResponse<null>>(`/adminList/${id}`);
};

// 根据ID修改管理员信息（仅admin可操作）
export const updateAdmin = (id: string, data: Partial<AdminUser> & { password?: string }) => {
  return request.put<ApiResponse<null>>(`/adminList/${id}`, data);
};

// 退出登录
export const adminLogout = () => {
  return request.get<ApiResponse<null>>('/adminList/outLogin');
};

// 申请成为商户
export const becomeMerchant = () => {
  return request.put<ApiResponse<null>>('/adminList/becomeMerchant');
};

// ==================== 管理员日志 API ====================

// 获取日志列表 - 响应: { code: 200, attrList: [], pageNo, pageSum, pageSize, count }
export const getAdminLogList = (params?: { adminName?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; attrList: AdminLog[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/adminLog', { params });
};

// 删除日志
export const deleteAdminLog = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/adminLog/${id}`);
};

// ==================== 分类 API ====================

// 获取所有分类（后台）- 响应: { code: 200, categoryList: [] }
export const getAllCategoryList = () => {
  return request.get<{ code: number; message: string; categoryList: Category[] }>('/product/AllCategoryList');
};

// 获取分类列表 - 响应: { code: 200, categoryList: [] }
export const getCategoryList = (params?: { parentId?: string }) => {
  return request.get<{ code: number; message: string; categoryList: Category[] }>('/product/categoryList', { params });
};

// 添加分类 - 响应: { code: 200, message: "添加分类成功", category: {} }
export const createCategory = (data: { name: string; parentId?: string; sort?: number }) => {
  return request.post<{ code: number; message: string; category: Category }>('/product/category', data);
};

// 修改分类 - 响应: { code: 200, message: "修改分类成功" }
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

// ==================== 品牌 API ====================

// 获取品牌列表（后台）- 响应: { code: 200, trademarkList: [], pageNo, pageSum, pageSize, count }
export const getTrademarkList = (params?: { keyword?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; trademarkList: Trademark[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/trademark', { params });
};

// 获取所有品牌 - 响应: { code: 200, trademarkList: [] }
export const getAllTrademark = () => {
  return request.get<{ code: number; message: string; trademarkList: Trademark[] }>('/product/allTrademark');
};

// 添加品牌 - 响应: { code: 200, message: "添加品牌成功", trademarkId, logoUrl }
export const createTrademark = (data: FormData) => {
  return request.post<{ code: number; message: string; trademarkId: string; logoUrl?: string }>('/product/trademark', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改品牌 - 响应: { code: 200, message: "修改品牌成功", logoUrl }
export const updateTrademark = (data: FormData) => {
  return request.put<{ code: number; message: string; logoUrl?: string }>('/product/trademark', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 根据ID获取品牌信息 - 响应: { code: 200, info: {} }
export const getTrademarkById = (id: string) => {
  return request.get<{ code: number; message: string; info: Trademark }>(`/product/trademark/${id}`);
};

// 删除品牌
export const deleteTrademark = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/trademark/${id}`);
};

// 修改是否显示
export const updateTrademarkShowFlag = (id: string, showFlag: number) => {
  return request.put<{ code: number; message: string }>(`/product/trademark/${id}/${showFlag}`);
};

// 批量删除品牌
export const batchDeleteTrademark = (ids: string[]) => {
  return request.delete<{ code: number; message: string }>('/product/trademarkBatchRemove', { data: ids });
};

// ==================== SPU API ====================

// 获取SPU列表
export const getSpuList = (params?: { shopId?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; spuList: Spu[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/spuList', { params });
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

// 获取SKU列表
export const getSkuList = (params?: { category1Id?: string; category2Id?: string; category3Id?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; skuList: Sku[]; pageNo: number; pageSum: number; pageSize: number; count: number }>('/product/skuList', { params });
};

// 根据ID获取SKU信息
export const getSkuDetail = (id: string) => {
  return request.get<{ code: number; skuInfo: Sku }>(`/product/sku/${id}`);
};

// 删除SKU
export const deleteSku = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/product/sku/${id}`);
};

// 添加SKU
export const createSku = (data: {
  name: string;
  fullName: string;
  shopId: string;
  spuId: string;
  category1Id?: string;
  category2Id?: string;
  categoryId?: string;
  price: number;
  defaultImg?: string;
}) => {
  return request.post<{ code: number; message: string }>('/product/sku', data);
};

// 修改SKU
export const updateSku = (data: {
  id: string;
  name?: string;
  fullName?: string;
  price?: number;
  defaultImg?: string;
}) => {
  return request.put<{ code: number; message: string }>('/product/sku', data);
};

// 修改是否上架
export const toggleSkuSale = (id: string, isSale: number) => {
  return request.put<{ code: number; message: string }>(`/product/sku/${id}/${isSale}`);
};

// ==================== 广告 API ====================

// 获取广告列表（后台）
export const getAdvList = (params?: { keyword?: string; pageNo?: number; pageSize?: number }) => {
  return request.get<{ code: number; message: string; data: Advertisement[]; pageNo: number; pageSum: number; pageSize: number; total: number }>('/advList', { params });
};

// 添加广告
export const createAdv = (data: { name: string; imgUrl: string; linkUrl?: string; advType?: number; sort?: number }) => {
  return request.post<{ code: number; message: string }>('/adv', data);
};

// 修改广告
export const updateAdv = (data: { id: string; name?: string; imgUrl?: string; linkUrl?: string; advType?: number; sort?: number }) => {
  return request.put<{ code: number; message: string }>('/adv', data);
};

// 修改广告状态
export const updateAdvStatus = (id: string, status: number) => {
  return request.put<{ code: number; message: string }>(`/adv/${id}/${status}`);
};

// 删除广告
export const deleteAdv = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/adv/${id}`);
};

// ==================== 店铺 API ====================

// 获取店铺列表
export const getShopList = () => {
  return request.get<{ code: number; message: string; shopList: Shop[] }>('/shopList');
};

// 创建店铺
export const createShop = (data: FormData) => {
  return request.post<{ code: number; message: string; shop: Shop }>('/shopList', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 修改店铺信息
export const updateShop = (id: string, data: Partial<Shop>) => {
  return request.put<{ code: number; message: string }>(`/shopList/${id}`, data);
};

// 删除店铺
export const deleteShop = (id: string) => {
  return request.delete<{ code: number; message: string }>(`/shopList/${id}`);
};

// 获取店铺详情
export const getShopDetail = (id: string) => {
  return request.get<{ code: number; shop: Shop }>(`/shopList/${id}`);
};

// ==================== 统计数据 API ====================

// 获取统计数据 - 响应: { code: 200, data: { productCount, orderCount, userCount, brandCount } }
export const getDashboardStats = () => {
  return request.get<{ code: number; data: { productCount: number; orderCount: number; userCount: number; brandCount: number } }>('/dashboard/stats');
};