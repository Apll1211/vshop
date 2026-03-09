import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://101.42.184.104:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 登录和注册接口不需要携带 token，防止旧 token 干扰后端校验
    const isAuthRequest = config.url?.includes('/login') || config.url?.includes('/register')
    if (isAuthRequest) {
      return config
    }

    // 根据路由判断使用哪个token
    const isAdminRoute = window.location.pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      // 管理后台使用adminToken，放在token请求头中
      const adminToken = localStorage.getItem('adminToken')
      if (adminToken && config.headers) {
        config.headers.token = adminToken
      }
    } else {
      // 前台使用userToken
      const userToken = localStorage.getItem('token')
      if (userToken && config.headers) {
        config.headers.token = userToken
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 返回response.data而不是整个response
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    console.log('API响应:', response.config.url, res)
    if (res.code !== 200) {
      // 错误处理
      if (res.code === 401) {
        // 登录接口返回401是登录失败，不需要跳转
        const isLoginRequest = response.config.url?.includes('/login')
        if (isLoginRequest) {
          console.log('登录失败:', res.message)
          return Promise.reject(new Error(res.message || '登录失败'))
        }
        // 其他接口返回401表示token无效，需要跳转登录页
        const isAdminRoute = window.location.pathname.startsWith('/admin')
        if (isAdminRoute) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminInfo')
          // 避免在登录页面重复跳转
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login'
          }
        } else {
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res as any
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  },
)

export default service
