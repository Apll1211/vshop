import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminLogin, adminLogout, getAdminInfo } from '@/api/admin';
import type { AdminUser, AdminLoginParams } from '@/api/admin';

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(localStorage.getItem('adminToken'));
  const user = ref<AdminUser | null>(() => {
    const stored = localStorage.getItem('adminInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isMerchant = computed(() => user.value?.isMerchant === 1 || user.value?.role === 'admin');

  const login = async (params: AdminLoginParams) => {
    console.log('AdminStore.login 被调用:', params);
    try {
      const res = await adminLogin(params);
      console.log('登录API响应:', res);
      // 登录响应: { code: 200, message: "登陆成功", token: "xxx" }
      // token在根级别，不在data里
      if (res.code === 200 && res.token) {
        token.value = res.token;
        localStorage.setItem('adminToken', res.token);
        console.log('Token已保存');
        // 登录成功后获取管理员信息
        await fetchAdminInfo();
        return { success: true };
      } else {
        console.log('登录失败，code:', res.code, 'message:', res.message);
        return { success: false, message: res.message || '登录失败' };
      }
    } catch (error: unknown) {
      console.error('登录异常:', error);
      const err = error as Error;
      return { success: false, message: err.message || '登录失败，请稍后重试' };
    }
  };

  const logout = async () => {
    try {
      await adminLogout();
    } catch {
      // ignore
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
    }
  };

  const fetchAdminInfo = async () => {
    console.log('fetchAdminInfo 被调用, token:', token.value);
    if (!token.value) return false;
    try {
      const res = await getAdminInfo();
      console.log('获取管理员信息响应:', res);
      // 获取管理员信息响应: { code: 200, info: {} }
      if (res.code === 200 && res.info) {
        user.value = res.info;
        localStorage.setItem('adminInfo', JSON.stringify(res.info));
        console.log('管理员信息已保存:', res.info);
        return true;
      } else {
        console.log('获取管理员信息失败, code:', res.code, 'message:', res.message);
        token.value = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        return false;
      }
    } catch (error) {
      console.error('获取管理员信息异常:', error);
      token.value = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      return false;
    }
  };

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isMerchant,
    login,
    logout,
    fetchAdminInfo,
  };
});
