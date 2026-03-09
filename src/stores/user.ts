import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getUserInfo, login, logout, register } from "@/api";
import type {
	UserInfo,
	UserLoginParams,
	UserRegisterParams,
} from "@/api/types";

export const useUserStore = defineStore(
	"user",
	() => {
		// 状态
		const userInfo = ref<UserInfo | null>(null);
		const token = ref<string>("");
		const isLoggedIn = computed(() => !!token.value);
		const userId = computed(() => userInfo.value?.id || "");

		// 登录
		async function loginAction(params: UserLoginParams) {
			try {
				const res = (await login(params)) as any;
				if (res.data) {
					userInfo.value = res.data as UserInfo;
					token.value = res.data.token || "";
					localStorage.setItem("token", token.value);
				}
				return res;
			} catch (error) {
				return Promise.reject(error);
			}
		}

		// 注册
		async function registerAction(params: UserRegisterParams) {
			try {
				const res = (await register(params)) as any;
				return res;
			} catch (error) {
				return Promise.reject(error);
			}
		}

		// 获取用户信息
		async function getUserInfoAction() {
			try {
				const res = (await getUserInfo()) as any;
				if (res.data) {
					userInfo.value = res.data as UserInfo;
				}
				return res;
			} catch (error) {
				return Promise.reject(error);
			}
		}

		// 退出登录
		function logoutAction() {
			userInfo.value = null;
			token.value = "";
			localStorage.removeItem("token");
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
		persist: {
			key: "vshop-user",
			storage: localStorage,
			pick: ["token", "userInfo"],
		},
	},
);
