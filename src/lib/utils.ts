import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * 格式化日期时间 (处理 UTC 转换)
 */
export function formatDate(dateStr?: string | Date) {
	if (!dateStr) return "-";
	try {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZone: "Asia/Shanghai",
		}).format(date);
	} catch (e) {
		return dateStr.toString();
	}
}
