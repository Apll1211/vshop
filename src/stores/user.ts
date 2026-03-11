import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getUserInfo, login, logout, register } from "@/api";
import type { UserInfo, UserLoginParams, UserRegisterParams } from "@/api/types";

export const useUserStore = defineStore(
	"user",
	() => {
		// 从持久化存储初始化
		const getStoredToken = () => localStorage.getItem("token") || "";
		const getStoredUserInfo = (): UserInfo | null => {
			const info = localStorage.getItem("userInfo");
			return info ? JSON.parse(info) : null;
		};

		// 状态
		const userInfo = ref<UserInfo | null>(getStoredUserInfo());
		const token = ref<string>(getStoredToken());
		const isLoggedIn = computed(() => !!token.value);
		const userId = computed(() => userInfo.value?._id || userInfo.value?.id || "");

		// 登录
		async function loginAction(params: UserLoginParams) {
			try {
				const res = (await login(params)) as any;
				// 严谨提取 Token 和 UserInfo
				const loginData = res.data || res;
				const loginToken = res.token || (res.data && res.data.token);

				if (loginToken) {
					token.value = loginToken;
					// 如果后端返回了完整用户对象，则更新
					if (loginData.username || loginData.phone) {
						userInfo.value = loginData as UserInfo;
						localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
					}
					localStorage.setItem("token", token.value);
					
					// 登录后尝试拉取最新完整信息
					await getUserInfoAction();
				}
				return res;
			} catch (error) {
				return Promise.reject(error);
			}
		}

		// 注册
		async function registerAction(params: UserRegisterParams) {
			try {
				return await register(params);
			} catch (error) {
				return Promise.reject(error);
			}
		}

		// 获取用户信息
		async function getUserInfoAction() {
			if (!token.value) return null;
			try {
				const res = (await getUserInfo()) as any;
				const info = res.data || res.info || res;
				if (info && (info.username || info.phone)) {
					userInfo.value = info as UserInfo;
					localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
				}
				return res;
			} catch (error) {
				// 如果 401 自动清理
				return Promise.reject(error);
			}
		}

		// 退出登录
		function logoutAction() {
			userInfo.value = null;
			token.value = "";
			localStorage.removeItem("token");
			localStorage.removeItem("userInfo");
		}

		return {
			userInfo,
			token,
			isLoggedIn,
			userId,
			loginAction,
			registerAction,
			getUserInfoAction,
			logoutAction,
		};
	},
	{
		persist: true // 使用全局持久化插件
	},
);
