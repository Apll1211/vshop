import request from "./request";

// 通用上传图片
export const uploadImage = (file: File) => {
	const formData = new FormData();
	formData.append("yumaImg", file);
	return request.post<{ code: number; message: string; url: string }>("/api/upload", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

// 上传SPU商品图片 (支持多张)
export const uploadSpuImages = (shopId: string, spuId: string, files: File[]) => {
	const formData = new FormData();
	formData.append("shopId", shopId);
	formData.append("spuId", spuId);
	files.forEach((file) => {
		formData.append("images", file);
	});
	return request.post<{
		code: number;
		message: string;
		urls: string[];
		count: number;
	}>("/api/upload/spu-images", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};
