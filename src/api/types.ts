// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

// 分类相关类型
export interface Category {
  id: string
  created_at: string
  name: string
  parentId: string | null
  showFlag: number
  sort: number
  updated_at: string
  catLevel: number
  ids: string[]
  children?: Category[]
}

export interface CategoryListResponse {
  code: number
  categoryList: Category[]
}

// 品牌相关类型
export interface Trademark {
  id: string
  created_at: string
  img: string
  name: string
  showFlag: number
  sort: number
  updated_at: string
}

export interface TrademarkListResponse {
  code: number
  message: string
  trademarkList: Trademark[]
}

// 商品相关类型
export interface SkuImage {
  id: string
  imgName: string
  imgUrl: string
  skuId: string
  spuImgId: string
  isDefault: number
}

export interface SkuSaleAttrValue {
  id: string
  saleAttrId: string
  saleAttrName: string
  saleAttrValueId: string
  saleAttrValueName: string
  skuId: string
  spuId: string
}

export interface SkuInfo {
  id: string
  spuId: string
  price: string
  skuName: string
  skuDesc: string
  weight: string
  tmId: string
  category3Id: string
  isSale: number
  skuDefaultImg: string
  skuImageList: SkuImage[]
  skuSaleAttrValueList: SkuSaleAttrValue[]
}

export interface SpuSaleAttr {
  id: string
  baseSaleAttrId: string
  saleAttrName: string
  spuId: string
  spuSaleAttrValueList: {
    id: string
    saleAttrName: string
    saleAttrValueName: string
    spuId: string
    baseSaleAttrId: string
  }[]
}

export interface ProductDetail {
  skuInfo: SkuInfo
  spuSaleAttrList: SpuSaleAttr[]
  price: string
}

// 用户相关类型
export interface UserRegisterParams {
  phone: string
  password: string
  username?: string
  code?: string
}

export interface UserLoginParams {
  phone: string
  password: string
}

export interface UserInfo {
  id: string
  phone: string
  username: string
  nickname?: string
  avatar?: string
  email?: string
  token?: string
}

export interface UserAddress {
  id: string
  consignee: string
  phone: string
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  districtCode: string
  districtName: string
  detailAddress: string
  isDefault: number
  userId: string
}

// 购物车相关类型
export interface CartItem {
  id: string
  skuId: string
  skuName: string
  skuPrice: string
  skuNum: number
  imgUrl: string
  isChecked: number
  userId: string
  skuInfo?: SkuInfo
}

export interface CartListResponse {
  code: number
  data: CartItem[]
}

// 订单相关类型
export interface OrderItem {
  id: string
  skuId: string
  skuName: string
  skuPrice: string
  skuNum: number
  imgUrl: string
  orderId: string
}

export interface OrderInfo {
  id: string
  orderNo: string
  userId: string
  totalAmount: string
  paymentMethod: number
  orderStatus: string
  paymentStatus: string
  consignee: string
  consigneeTel: string
  deliveryAddress: string
  createTime: string
  updateTime: string
  orderDetailList: OrderItem[]
}

export interface OrderListResponse {
  code: number
  data: {
    records: OrderInfo[]
    total: number
    size: number
    current: number
    pages: number
  }
}

export interface SubmitOrderParams {
  addressId: string
  skuInfoList: {
    skuId: string
    skuNum: number
  }[]
  paymentMethod: number
}

// 收藏相关类型
export interface CollectItem {
  id: string
  skuId: string
  userId: string
  createTime: string
  skuInfo?: SkuInfo
}

// 广告相关类型
export interface Advertisement {
  id: string
  title: string
  imgUrl: string
  linkUrl: string
  position: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

// Banner类型
export interface Banner {
  id: string
  title: string
  imgUrl: string
  linkUrl?: string
}

// 楼层内容类型
export interface FloorContent {
  id: string
  name: string
  tabs?: string[]
  keywords?: string[]
  products?: ProductInfo[]
}

// 商品信息（列表用）
export interface ProductInfo {
  id: number
  name: string
  title?: string
  price: number
  originalPrice?: number
  defaultImg?: string
  hotScore?: number
}
