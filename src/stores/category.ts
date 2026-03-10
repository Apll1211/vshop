import { defineStore } from "pinia";
import { ref } from "vue";
import { getBaseCategoryList } from "@/api";
import type { Category } from "@/api/types";

export const useCategoryStore = defineStore("category", () => {
	// 状态
	const categoryList = ref<Category[]>([]);
	const loading = ref(false);

	// 获取分类列表
	async function getCategoryList() {
		if (categoryList.value.length > 0) return categoryList.value;

		loading.value = true;
		try {
			const res = (await getBaseCategoryList()) as any;
			if (res.categoryList) {
				categoryList.value = res.categoryList;
			}
			return categoryList.value;
		} catch (error) {
			console.error("获取分类失败:", error);
			return [];
		} finally {
			loading.value = false;
		}
	}

	// 根据ID获取分类
	function getCategoryById(id: string) {
		for (const cat1 of categoryList.value) {
			if (cat1.id === id) return cat1;
			if (cat1.children) {
				for (const cat2 of cat1.children) {
					if (cat2.id === id) return cat2;
					if (cat2.children) {
						for (const cat3 of cat2.children) {
							if (cat3.id === id) return cat3;
						}
					}
				}
			}
		}
		return null;
	}

	return {
		categoryList,
		loading,
		getCategoryList,
		getCategoryById,
	};
});
