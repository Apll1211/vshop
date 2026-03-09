import request from './request'
import type { Advertisement, Banner, FloorContent } from './types'

// 获取轮播图广告（前台）
export function getAdvList(limit: number = 4) {
  return request.get<{ code: number; data: Advertisement[] }>(`/api/advList/${limit}`)
}

// 获取首页Banner
export function getBannerList() {
  return request.get<{ code: number; data: Banner[] }>('/api/banner')
}

// 获取楼层内容
export function getFloorContent() {
  return request.get<{ code: number; data: FloorContent[] }>('/api/floor')
}
