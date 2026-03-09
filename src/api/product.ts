import request from './request'
import type { CategoryListResponse, TrademarkListResponse, ProductDetail } from './types'

// 获取分类树（前台）
export function getCategoryTree() {
  return request.get<CategoryListResponse>('/api/product/category/tree')
}

// 获取基础分类列表（前台）
export function getBaseCategoryList() {
  return request.get<CategoryListResponse>('/api/product/getBaseCategoryList')
}

// 获取品牌列表（前台）
export function getTrademarkList(limit: number = 6) {
  return request.get<TrademarkListResponse>(`/api/product/trademark/${limit}`)
}

// 获取品牌列表（分页）
export function getTrademarkListPage(params: { page?: number; limit?: number }) {
  return request.get('/api/product/trademark/list', { params })
}

// 获取商品详情
export function getProductDetail(id: string) {
  return request.get<ProductDetail>(`/api/product/item/${id}`)
}

// 获取属性列表（前台）
export function getAttrList(category1Id: string, category2Id: string, category3Id: string) {
  return request.get(`/api/product/attr/list/${category1Id}/${category2Id}/${category3Id}`)
}

// 搜索商品
export interface SearchParams {
  keyword?: string
  page?: number
  pageSize?: number
  trademark?: string
  order?: string
}

export interface SearchResponse {
  code: number
  data: any[]
  total: number
}

export function searchProducts(params: SearchParams) {
  return request.get<SearchResponse>('/api/product/search', { params })
}
