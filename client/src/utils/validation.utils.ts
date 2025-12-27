import { z } from "zod";

// Common Validation Schemas
export const emailSchema = z
	.string()
	.min(1, "Email là bắt buộc")
	.email("Email không hợp lệ");

export const passwordSchema = z
	.string()
	.min(8, "Mật khẩu phải có ít nhất 8 ký tự")
	.regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
	.regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
	.regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số");

export const usernameSchema = z
	.string()
	.min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
	.max(50, "Tên đăng nhập không được quá 50 ký tự")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới"
	);

export const phoneSchema = z
	.string()
	.regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
	.optional();

export const urlSchema = z.string().url("URL không hợp lệ").optional();

// Login Schema
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

// Change Password Schema
export const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, "Mật khẩu cũ là bắt buộc"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

// User Create Schema
export const userCreateSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	fullName: z
		.string()
		.min(1, "Họ tên là bắt buộc")
		.max(100, "Họ tên không được quá 100 ký tự"),
	phoneNumber: phoneSchema,
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	address: z.string().max(255, "Địa chỉ không được quá 255 ký tự").optional(),
	departmentId: z.number().positive("Khoa là bắt buộc").optional(),
	roleIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 vai trò"),
});

// User Update Schema
export const userUpdateSchema = z.object({
	email: emailSchema.optional(),
	fullName: z
		.string()
		.min(1, "Họ tên là bắt buộc")
		.max(100, "Họ tên không được quá 100 ký tự")
		.optional(),
	phoneNumber: phoneSchema,
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	address: z.string().max(255, "Địa chỉ không được quá 255 ký tự").optional(),
	departmentId: z.number().positive().optional(),
	roleIds: z.array(z.number()).optional(),
	status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
});

// Resource Upload Schema
export const resourceUploadSchema = z.object({
	title: z
		.string()
		.min(1, "Tiêu đề là bắt buộc")
		.max(255, "Tiêu đề không được quá 255 ký tự"),
	description: z
		.string()
		.max(1000, "Mô tả không được quá 1000 ký tự")
		.optional(),
	category: z.string().min(1, "Danh mục là bắt buộc"),
	resourceTypeId: z.number().positive("Loại học liệu là bắt buộc"),
	classroomId: z.number().positive().optional(),
	courseId: z.number().positive("Học phần là bắt buộc"),
});

// Category Create Schema (for Department, Course, etc.)
export const categoryCreateSchema = z.object({
	name: z
		.string()
		.min(1, "Tên là bắt buộc")
		.max(255, "Tên không được quá 255 ký tự"),
	code: z
		.string()
		.min(1, "Mã là bắt buộc")
		.max(50, "Mã không được quá 50 ký tự"),
	description: z
		.string()
		.max(1000, "Mô tả không được quá 1000 ký tự")
		.optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ResourceUploadFormData = z.infer<typeof resourceUploadSchema>;
export type CategoryCreateFormData = z.infer<typeof categoryCreateSchema>;
