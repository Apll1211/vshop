import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";

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

// 路由守卫
router.beforeEach((to, _from, next) => {
	// 设置页面标题
	document.title = (to.meta.title as string) || "南渡商城";

	// 检查是否需要登录
	if (to.meta.requiresAuth) {
		const token = localStorage.getItem("token");
		if (!token) {
			next({ name: "login", query: { redirect: to.fullPath } });
			return;
		}
	}

	next();
});

export default router;
