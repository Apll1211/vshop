/**
 * 通用响应结构
 */
export interface ApiResponse<T = any> {
	code: number;
	message: string;
	data?: T;
	[key: string]: any;
}

/**
 * 分页响应结构
 */
export interface PagedResponse<T> {
	code: number;
	message: string;
	pageNo: number;
	pageSum: number;
	pageSize: number;
	count: number;
	[key: string]: any; // 动态 key，如 skuList, spuList 等
}

// ==================== 分类相关 ====================

export interface Category {
	_id: string;
	id: string;
	actualId?: string; // 兼容后端 id
	name: string;
	parentId?: string | null;
	level?: number;
	showFlag: number;
	sort: number;
	children?: Category[];
}

export interface CategoryListResponse extends ApiResponse {
	categoryList: Category[];
}

// ==================== 品牌相关 ====================

export interface Trademark {
	_id: string;
	id: string;
	tmName?: string; // 部分接口返回 tmName
	name: string;
	logoUrl?: string; // 部分接口返回 logoUrl
	logo: string;
	sort: number;
	showFlag: number;
}

export interface TrademarkListResponse extends ApiResponse {
	trademarkList: Trademark[];
}

// ==================== 商品属性相关 ====================

/**
 * SPU 销售属性值 (后端新格式)
 */
export interface SpuSaleAttrValue {
	id?: string;
	_id?: string;
	saleAttrValueName?: string;
	attrValue?: string;
	isChecked?: string | number;
}

/**
 * SPU 销售属性 (后端新格式)
 * @example { attr: "颜色", attrValue: ["红", "绿", "蓝"] }
 */
export interface SpuSaleAttr {
	attr: string;
	saleAttrName?: string; // 兼容
	attrValue: (string | SpuSaleAttrValue)[];
	spuSaleAttrValueList?: SpuSaleAttrValue[]; // 兼容
}

/**
 * SKU 属性值 (后端新格式)
 * @example { attr: "颜色", attrValue: "红" }
 */
export interface SkuAttrValue {
	attr: string;
	attrValue: string;
	saleAttrValueName?: string; // 兼容
	saleAttrName?: string; // 兼容
}

// ==================== SPU 相关 ====================

export interface Spu {
	_id: string;
	id: string;
	spuName?: string; // 兼容
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
}

// ==================== SKU 相关 ====================

export interface SkuImage {
	_id?: string;
	id?: string;
	imgName?: string;
	imgUrl: string;
	isDefault?: number;
}

export interface Sku {
	_id: string;
	id: string;
	spuId: string;
	shopId?: string;
	skuName?: string; // 兼容
	fullName?: string; // 兼容
	name: string;
	price: number;
	skuDefaultImg?: string;
	defaultImg?: string;
	stock: number;
	isSale: number | string;
	skuImageList?: SkuImage[];
	skuSaleAttrValueList?: SkuAttrValue[]; // 后端新格式
	skuAttrValueList?: SkuAttrValue[];     // 后端新格式
}

/**
 * 商品简要信息 (用于列表展示)
 */
export interface ProductInfo {
	_id: string;
	id: string;
	name: string;
	fullName?: string;
	title?: string;
	price: number;
	originalPrice?: number;
	defaultImg?: string;
	stock?: number;
	hotScore?: number;
}

/**
 * 商品详情 (前台)
 */
export interface ProductDetail {
	skuInfo: Sku;
	spuSaleAttrList: SpuSaleAttr[];
	price?: number;
}

// ==================== 用户相关 ====================

export interface UserInfo {
	_id?: string;
	id?: string;
	phone: string;
	username?: string;
	nickName?: string;
	avatar?: string;
	email?: string;
	status?: number;
	regTime?: string;
	loginTime?: string;
	outLoginTime?: string;
	token?: string;
}

export interface UserLoginParams {
	phone: string;
	password?: string;
	code?: string;
}

export interface UserRegisterParams {
	phone: string;
	password?: string;
	code?: string;
}

export interface UserAddress {
	_id: string;
	id: string;
	consignee: string;
	phone: string;
	provinceName?: string;
	cityName?: string;
	districtName?: string;
	detailAddress: string;
	isDefault: number;
	userId: string;
}

// ==================== 购物车与订单 ====================

export interface CartItem {
	_id: string;
	id: string;
	skuId: string;
	skuName: string;
	skuPrice: number;
	skuNum: number;
	imgUrl: string;
	isChecked: number;
	userId: string;
}

export interface CartListResponse extends ApiResponse {
	cartList: CartItem[];
}

export interface OrderItem {
	_id: string;
	id: string;
	skuId: string;
	skuName: string;
	skuPrice: number;
	skuNum: number;
	imgUrl: string;
	orderId: string;
}

export interface Order {
	_id: string;
	id: string;
	orderNo: string;
	userId: string;
	totalAmount: number;
	orderStatus: string | number;
	deliveryAddress: string;
	consignee: string;
	consigneeTel: string;
	createTime: string;
	orderDetailList?: OrderItem[];
}

export interface SubmitOrderParams {
	consignee: string;
	consigneeTel: string;
	deliveryAddress: string;
	paymentWay: string;
	orderComment?: string;
	orderDetailList?: any[];
	addressId?: string;
	skuInfoList?: any[];
	paymentMethod?: string | number;
}

export interface OrderListResponse extends ApiResponse {
	orderList: Order[];
}

// ==================== 管理员相关 ====================

export interface AdminUser {
	_id: string;
	id: string;
	adminName: string;
	nickName?: string;
	avatar?: string;
	role: "admin" | "merchant";
	createTime?: string;
	loginTime?: string;
}

export interface AdminLoginParams {
	adminName: string;
	password?: string;
}

export interface AdminLoginResponse extends ApiResponse {
	token: string;
	info: AdminUser;
}

export interface AdminLog {
	_id: string;
	id: string;
	adminName: string;
	describe: string;
	ip?: string;
	created_at: string;
	method?: string;
	url?: string;
}

// ==================== 其他 ====================

export interface Shop {
	_id: string;
	id: string;
	name: string;
	logo?: string;
	description?: string;
	status: number;
}

export interface Advertisement {
	_id: string;
	id: string;
	title: string;
	name?: string; // 兼容
	imgUrl: string;
	linkUrl?: string;
	status: number;
	sort: number;
}

