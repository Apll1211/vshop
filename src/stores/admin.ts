import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { adminLogin, adminLogout, getAdminInfo } from "@/api";
import type { AdminLoginParams, AdminLoginResponse, AdminUser } from "@/api/types";

export interface AdminLoginParamsLocal {
	adminName: string;
	password: string;
}

export const useAdminStore = defineStore("admin", () => {
	const token = ref<string | null>(localStorage.getItem("adminToken"));

	// 隐身模式状态：默认开启 (除非手动关闭)
	const getInitialStealth = (): boolean => {
		const stored = localStorage.getItem("stealthMode");
		if (stored === null) {
			localStorage.setItem("stealthMode", "true");
			return true;
		}
		return stored === "true";
	};

	const stealthMode = ref(getInitialStealth());

	// 立即从 localStorage 获取初始用户信息
	const getInitialUser = (): AdminUser | null => {
		const stored = localStorage.getItem("adminInfo");
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				return null;
			}
		}
		return null;
	};

	const user = ref<AdminUser | null>(getInitialUser());

	const isLoggedIn = computed(() => !!token.value && !!user.value);
	const isAdmin = computed(() => user.value?.role === "admin");
	const isMerchant = computed(
		() => user.value?.role === "merchant" || user.value?.role === "admin",
	);

	const toggleStealthMode = () => {
		stealthMode.value = !stealthMode.value;
		localStorage.setItem("stealthMode", String(stealthMode.value));
		if (stealthMode.value) {
			console.log(
				"%c[隐私] 隐身模式已开启，敏感操作日志将自动擦除",
				"color: #a855f7; font-weight: bold;",
			);
		} else {
			console.log("%c[隐私] 隐身模式已关闭", "color: #999;");
		}
	};

	const login = async (params: AdminLoginParamsLocal) => {
		try {
			const res = await adminLogin(params);
			if (res && res.token) {
				token.value = res.token;
				localStorage.setItem("adminToken", res.token);
				await fetchAdminInfo();
				return { success: true };
			} else {
				return { success: false, message: (res as any)?.message || "登录失败" };
			}
		} catch (error: any) {
			return { success: false, message: error.message || "登录失败，请稍后重试" };
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
			localStorage.removeItem("adminToken");
			localStorage.removeItem("adminInfo");
		}
	};

	const fetchAdminInfo = async () => {
		if (!token.value) return false;
		try {
			const res = await getAdminInfo();
			if (res && res.info) {
				user.value = res.info;
				localStorage.setItem("adminInfo", JSON.stringify(res.info));
				return true;
			} else {
				token.value = null;
				localStorage.removeItem("adminToken");
				localStorage.removeItem("adminInfo");
				return false;
			}
		} catch {
			token.value = null;
			localStorage.removeItem("adminToken");
			localStorage.removeItem("adminInfo");
			return false;
		}
	};

	return {
		token,
		user,
		stealthMode,
		isLoggedIn,
		isAdmin,
		isMerchant,
		login,
		logout,
		fetchAdminInfo,
		toggleStealthMode,
	};
});
