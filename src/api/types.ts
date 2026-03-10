// 通用响应类型
export interface ApiResponse<T = any> {
	code: number;
	message: string;
	data?: T;
	[key: string]: any;
}

// 分类相关类型
export interface Category {
	_id: string;
	id: string; // 后端可能返回 id 或 _id，统一映射
	name: string;
	parentId?: string | null;
	level?: number;
	showFlag: number;
	sort: number;
	children?: Category[];
}

export interface CategoryListResponse {
	code: number;
	message: string;
	categoryList: Category[];
}

// 品牌相关类型
export interface Trademark {
	_id: string;
	id: string;
	name: string;
	logo: string;
	sort: number;
	showFlag: number;
}

export interface TrademarkListResponse {
	code: number;
	message: string;
	trademarkList: Trademark[];
	total?: number;
	pageNo?: number;
	pageSize?: number;
	pageSum?: number;
	count?: number;
}

// SPU 相关类型
export interface SpuSaleAttrValue {
	_id?: string;
	id?: string;
	saleAttrValueName: string; // 修正字段名
	name?: string;
	isSelected?: boolean;
}

export interface SpuSaleAttr {
	_id: string;
	id?: string;
	saleAttrName: string; // 修正字段名
	name?: string;
	spuSaleAttrValueList: SpuSaleAttrValue[]; // 修正字段名
	isSelected?: boolean;
}

export interface Spu {
	_id: string;
	id: string;
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

// SKU 相关类型
export interface SkuImage {
	_id?: string;
	id?: string;
	imgName?: string;
	imgUrl: string;
	isDefault?: number;
}

export interface SkuSaleAttrValue {
	_id?: string;
	id?: string;
	saleAttrId: string;
	saleAttrName: string;
	saleAttrValueId: string;
	saleAttrValueName: string;
}

export interface Sku {
	_id: string;
	id: string;
	spuId: string;
	shopId?: string;
	name: string;
	fullName?: string;
	price: number;
	skuDefaultImg?: string;
	defaultImg?: string;
	stock: number;
	isSale: number;
	skuImageList?: SkuImage[];
	skuSaleAttrValueList?: Record<string, string> | SkuSaleAttrValue[]; // 支持对象或数组
	skuAttrValueList?: Record<string, string> | any[];
}

// 统一的商品简要信息类型，用于列表展示
export interface ProductInfo {
	_id: string;
	id: string;
	name: string;
	title?: string; // 兼容写法
	fullName?: string;
	price: number;
	originalPrice?: number;
	defaultImg?: string;
	hotScore?: number;
	stock?: number;
}

export interface ProductDetail {
	skuInfo: Sku;
	spuSaleAttrList: SpuSaleAttr[];
	price?: number;
}

// 用户相关类型
export interface UserInfo {
	_id: string;
	id: string;
	phone: string;
	username: string;
	nickname?: string;
	avatar?: string;
	email?: string;
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
	username?: string;
	nickname?: string;
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

// 购物车相关类型
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

export interface CartListResponse {
	code: number;
	message: string;
	cartList: CartItem[];
}

// 订单相关类型
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
	orderStatus: string;
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
	addressId?: string | number;
	paymentWay: string;
	orderComment: string;
	orderDetailList: Partial<OrderItem>[];
}

export interface OrderListResponse {
	code: number;
	message: string;
	orderList: Order[];
	pageNo: number;
	pageSum: number;
	pageSize: number;
	count: number;
}

// 管理员相关类型
export interface AdminUser {
	_id: string;
	id: string;
	adminName: string;
	nickName?: string;
	avatar?: string;
	role: "admin" | "merchant";
	createTime: string;
}

export interface AdminLoginParams {
	adminName: string;
	password: string;
}

export interface AdminLoginResponse {
	code: number;
	message: string;
	token: string;
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

// 店铺相关类型
export interface Shop {
	_id: string;
	id: string;
	name: string;
	logo?: string;
	description?: string;
	status: number;
}

// 广告相关类型
export interface Advertisement {
	_id: string;
	id: string;
	title: string;
	imgUrl: string;
	linkUrl?: string;
	status: number;
}
