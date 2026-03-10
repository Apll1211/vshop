import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		name: "home",
		component: () => import("@/views/HomeView.vue"),
		meta: { title: "首页 - 南渡商城" },
	},
	{
		path: "/search",
		name: "search",
		component: () => import("@/views/SearchView.vue"),
		meta: { title: "商品搜索 - 南渡商城" },
	},
	{
		path: "/product/:id",
		name: "product-detail",
		component: () => import("@/views/ProductDetailView.vue"),
		meta: { title: "商品详情 - 南渡商城" },
	},
	{
		path: "/cart",
		name: "cart",
		component: () => import("@/views/CartView.vue"),
		meta: { title: "购物车 - 南渡商城" },
	},
	{
		path: "/login",
		name: "login",
		component: () => import("@/views/LoginView.vue"),
		meta: { title: "登录 - 南渡商城" },
	},
	{
		path: "/register",
		name: "register",
		component: () => import("@/views/LoginView.vue"),
		meta: { title: "注册 - 南渡商城" },
	},
	{
		path: "/checkout",
		name: "checkout",
		component: () => import("@/views/CheckoutView.vue"),
		meta: { title: "结算 - 南渡商城", requiresAuth: true },
	},
	{
		path: "/orders",
		name: "orders",
		component: () => import("@/views/OrdersView.vue"),
		meta: { title: "我的订单 - 南渡商城", requiresAuth: true },
	},
	{
		path: "/pay/:orderId",
		name: "pay",
		component: () => import("@/views/PayView.vue"),
		meta: { title: "支付 - 南渡商城", requiresAuth: true },
	},
	{
		path: "/pay-success/:orderId",
		name: "pay-success",
		component: () => import("@/views/PaySuccessView.vue"),
		meta: { title: "支付成功 - 南渡商城", requiresAuth: true },
	},
	{
		path: "/about",
		name: "about",
		component: () => import("@/views/AboutView.vue"),
		meta: { title: "关于我们 - 南渡商城" },
	},
	// 管理员登录页面
	{
		path: "/admin/login",
		name: "admin-login",
		component: () => import("@/views/admin/AdminLoginView.vue"),
		meta: { title: "管理员登录 - 南渡商城" },
	},
	// 后台管理
	{
		path: "/admin",
		component: () => import("@/views/admin/AdminLayout.vue"),
		meta: { requiresAdminAuth: true },
		children: [
			{
				path: "",
				name: "admin-dashboard",
				component: () => import("@/views/admin/DashboardView.vue"),
				meta: { title: "控制台 - 南渡商城" },
			},
			{
				path: "category",
				name: "admin-category",
				component: () => import("@/views/admin/CategoryView.vue"),
				meta: { title: "分类管理 - 南渡商城" },
			},
			{
				path: "brand",
				name: "admin-brand",
				component: () => import("@/views/admin/BrandView.vue"),
				meta: { title: "品牌管理 - 南渡商城" },
			},
			{
				path: "product",
				name: "admin-product",
				component: () => import("@/views/admin/ProductView.vue"),
				meta: { title: "商品管理 - 南渡商城" },
			},
			{
				path: "advertisement",
				name: "admin-advertisement",
				component: () => import("@/views/admin/AdvertisementView.vue"),
				meta: { title: "广告管理 - 南渡商城" },
			},
			{
				path: "shop",
				name: "admin-shop",
				component: () => import("@/views/admin/ShopView.vue"),
				meta: { title: "店铺管理 - 南渡商城" },
			},
			{
				path: "admin-user",
				name: "admin-user",
				component: () => import("@/views/admin/AdminUserView.vue"),
				meta: { title: "管理员管理 - 南渡商城", requiresAdmin: true },
			},
			{
				path: "log",
				name: "admin-log",
				component: () => import("@/views/admin/AdminLogView.vue"),
				meta: { title: "操作日志 - 南渡商城", requiresAdmin: true },
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		name: "not-found",
		component: () => import("@/views/NotFoundView.vue"),
		meta: { title: "页面不存在 - 南渡商城" },
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior() {
		return { top: 0 };
	},
});

// 路由守卫：修复商户无法登录的问题
router.beforeEach(async (to) => {
	document.title = (to.meta.title as string) || "南渡商城";

	// 检查前台登录
	if (to.meta.requiresAuth) {
		const token = localStorage.getItem("token");
		if (!token) return { name: "login", query: { redirect: to.fullPath } };
	}

	// 检查后台管理认证
	if (to.meta.requiresAdminAuth) {
		const adminToken = localStorage.getItem("adminToken");
		// 没有 Token 强制去登录
		if (!adminToken) return { name: "admin-login" };

		// 如果目标路由明确要求超级管理员权限 (如管理员管理、日志)
		if (to.meta.requiresAdmin) {
			const adminInfoStr = localStorage.getItem("adminInfo");
			if (adminInfoStr) {
				try {
					const adminInfo = JSON.parse(adminInfoStr);
					// 仅当明确判定为非 admin 且信息有效时才拦截
					if (adminInfo && adminInfo.role && adminInfo.role !== "admin") {
						console.warn("权限不足：商户账号尝试访问敏感管理模块，已重定向至控制台");
						return { name: "admin-dashboard" };
					}
				} catch (e) {
					// 解析失败时不强行拦截，由后续组件加载去处理
				}
			}
		}
	}

	return true;
});

export default router;
