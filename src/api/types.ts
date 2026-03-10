// 通用响应类型
export interface ApiResponse<T = unknown> {
	code: number;
	message: string;
	data?: T;
	[key: string]: any;
}

// 分类相关类型
export interface Category {
	_id: string;
	id?: string;
	name: string;
	parentId?: string | null;
	level?: number;
	showFlag: number;
	sort: number;
	children?: Category[];
	createTime?: string;
	updateTime?: string;
	catLevel?: number;
	ids?: string[];
}

export interface CategoryListResponse {
	code: number;
	message: string;
	categoryList: Category[];
}

// 品牌相关类型
export interface Trademark {
	_id: string;
	id?: string;
	name: string;
	logo: string;
	sort: number;
	showFlag: number;
	createTime?: string;
	updateTime?: string;
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
	name: string;
	isSelected?: boolean;
}

export interface SpuSaleAttr {
	_id: string;
	id?: string;
	name: string;
	valueList?: { _id: string; name: string }[];
	valueArr?: string[];
	isSelected?: boolean;
}

export interface Spu {
	_id: string;
	id?: string;
	name: string;
	description?: string;
	trademarkId?: string;
	shopId?: string;
	category1Id?: string;
	category2Id?: string;
	categoryId?: string;
	images: string[];
	imgs?: string[];
	spuSaleAttrList?: SpuSaleAttr[];
	showFlag: number;
	sort: number;
	createTime?: string;
	updateTime?: string;
}

// SKU 相关类型
export interface SkuImage {
	id?: string;
	imgName?: string;
	imgUrl: string;
	skuId?: string;
	spuImgId?: string;
	isDefault?: number;
}

export interface SkuSaleAttrValue {
	id?: string;
	attrId?: string;
	saleAttrId?: string;
	saleAttrName?: string;
	valueId?: string;
	saleAttrValueId?: string;
	valueName?: string;
	saleAttrValueName?: string;
	skuId?: string;
	spuId?: string;
}

export interface Sku {
	_id: string;
	id?: string;
	spuId: string;
	shopId?: string;
	name: string;
	fullName?: string;
	price: number;
	defaultImg?: string;
	skuDefaultImg?: string;
	stock?: number;
	isSale: number;
	category1Id?: string;
	category2Id?: string;
	categoryId?: string;
	skuImageList?: SkuImage[];
	skuSaleAttrValueList?: SkuSaleAttrValue[];
	skuAttrValueList?: any[];
	createTime?: string;
	updateTime?: string;
}

export interface ProductDetail {
	skuInfo: Sku;
	spuSaleAttrList: SpuSaleAttr[];
	price?: string | number;
}

// 用户相关类型
export interface UserRegisterParams {
	phone: string;
	password?: string;
	username?: string;
	nickname?: string;
	code?: string;
}

export interface UserLoginParams {
	phone: string;
	password?: string;
	code?: string;
}

export interface UserInfo {
	_id?: string;
	id: string;
	phone: string;
	username: string;
	nickname?: string;
	nickName?: string;
	avatar?: string;
	email?: string;
	token?: string;
	status?: number;
	createTime?: string;
}

export interface UserAddress {
	_id?: string;
	id: string;
	consignee: string;
	phone?: string;
	phoneNum?: string;
	area?: string[];
	specific?: string;
	provinceCode?: string;
	provinceName?: string;
	cityCode?: string;
	cityName?: string;
	districtCode?: string;
	districtName?: string;
	detailAddress?: string;
	isDefault: number;
	addressType?: number;
	userId: string;
}

// 购物车相关类型
export interface CartItem {
	_id?: string;
	id: string;
	skuId: string;
	skuName: string;
	skuPrice: string | number;
	skuNum: number;
	imgUrl: string;
	isChecked: number;
	userId: string;
	skuInfo?: Sku;
}

export interface CartListResponse {
	code: number;
	message: string;
	data: CartItem[];
}

// 订单相关类型
export interface OrderItem {
	_id?: string;
	id: string;
	skuId: string;
	skuName: string;
	skuPrice: string | number;
	skuNum: number;
	imgUrl: string;
	orderId: string;
}

export interface Order {
	_id: string;
	id?: string;
	orderNo: string;
	tradeNo?: string;
	userId: string;
	userName?: string;
	totalAmount: number | string;
	orderStatus: string;
	paymentWay?: string;
	paymentMethod?: number;
	deliveryAddress: string;
	consignee: string;
	consigneeTel: string;
	orderComment?: string;
	createTime: string;
	updateTime: string;
	orderDetailList?: OrderItem[];
}

export interface OrderListResponse {
	code: number;
	message: string;
	orderList?: Order[];
	data?: {
		records: Order[];
		total: number;
		size: number;
		current: number;
		pages: number;
	};
	pageNo?: number;
	pageSum?: number;
	pageSize?: number;
	count?: number;
}

export interface SubmitOrderParams {
	tradeNo?: string;
	consignee: string;
	consigneeTel: string;
	deliveryAddress: string;
	paymentWay: string;
	orderComment?: string;
	addressId?: string;
	skuInfoList?: {
		skuId: string;
		skuNum: number;
	}[];
	paymentMethod?: number;
}

// 管理员相关类型
export interface AdminUser {
	_id: string;
	id?: string;
	adminName: string;
	nickName?: string;
	avatar?: string;
	role: "admin" | "merchant";
	isMerchant?: number;
	createTime: string;
	updateTime: string;
}

export interface AdminLog {
	_id: string;
	id?: string;
	adminId: string;
	adminName: string;
	operation?: string;
	describe: string;
	ip?: string;
	created_at: string;
	method?: string;
	url?: string;
}

// 店铺相关类型
export interface Shop {
	_id: string;
	id?: string;
	name: string;
	logo?: string;
	description?: string;
	adminId?: string;
	status: number;
	createTime: string;
	updateTime: string;
}

// 广告相关类型
export interface Advertisement {
	_id: string;
	id?: string;
	name?: string;
	title?: string;
	imgUrl: string;
	linkUrl?: string;
	advType?: number;
	position?: string;
	sort: number;
	status: number;
	createTime: string;
	updateTime: string;
}

export interface Banner {
	id: string;
	title: string;
	imgUrl: string;
	linkUrl?: string;
}

export interface FloorContent {
	id: string;
	name: string;
	tabs?: string[];
	keywords?: string[];
	products?: any[];
}
