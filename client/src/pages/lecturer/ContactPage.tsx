import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const contactSchema = z.object({
	name: z.string().min(1, 'Vui lòng nhập tên của bạn'),
	email: z.string().email('Email không hợp lệ'),
	subject: z.string().min(1, 'Vui lòng nhập chủ đề'),
	message: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
});

type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Contact Page - Form liên hệ góp ý
 */
const ContactPage: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: '',
			email: '',
			subject: '',
			message: '',
		},
	});

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		try {
			// TODO: Implement API call to send contact form
			// await contactApi.sendContactForm(data);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const _unused = data;
			
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			
			toast.success('Gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.');
			reset();
		} catch {
			toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Card>
				<Space direction="vertical" size="large" className="w-full">
					<div>
						<Title level={1} className="flex items-center gap-2">
							<MailOutlined className="text-blue-500" />
							Liên hệ - Góp ý
						</Title>
						<Paragraph className="text-gray-600">
							Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ bạn. Vui lòng điền
							form bên dưới hoặc liên hệ trực tiếp.
						</Paragraph>
					</div>

					<Divider />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Contact Information */}
						<div>
							<Title level={3}>Thông tin liên hệ</Title>
							<Space direction="vertical" size="middle" className="w-full mt-4">
								<div className="flex items-start gap-3">
									<MailOutlined className="text-blue-500 text-xl mt-1" />
									<div>
										<Text strong>Email</Text>
										<Paragraph className="mb-0 text-gray-600">
											support@library.edu.vn
										</Paragraph>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<PhoneOutlined className="text-green-500 text-xl mt-1" />
									<div>
										<Text strong>Điện thoại</Text>
										<Paragraph className="mb-0 text-gray-600">
											(024) 1234 5678
										</Paragraph>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<EnvironmentOutlined className="text-red-500 text-xl mt-1" />
									<div>
										<Text strong>Địa chỉ</Text>
										<Paragraph className="mb-0 text-gray-600">
											Trường Đại học ABC
											<br />
											123 Đường XYZ, Quận ABC, TP. Hà Nội
										</Paragraph>
									</div>
								</div>
							</Space>

							<Divider />

							<div className="bg-blue-50 p-4 rounded-lg">
								<Title level={5}>Giờ làm việc</Title>
								<Paragraph className="mb-0">
									<Text strong>Thứ 2 - Thứ 6:</Text> 8:00 - 17:00
									<br />
									<Text strong>Thứ 7:</Text> 8:00 - 12:00
									<br />
									<Text strong>Chủ nhật:</Text> Nghỉ
								</Paragraph>
							</div>
						</div>

						{/* Contact Form */}
						<div>
							<Title level={3}>Gửi tin nhắn</Title>
							<Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
								<Form.Item
									label="Họ và tên"
									validateStatus={errors.name ? 'error' : ''}
									help={errors.name?.message}
								>
									<Controller
										name="name"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												placeholder="Nhập họ và tên"
												size="large"
											/>
										)}
									/>
								</Form.Item>

								<Form.Item
									label="Email"
									validateStatus={errors.email ? 'error' : ''}
									help={errors.email?.message}
								>
									<Controller
										name="email"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="email"
												placeholder="your.email@example.com"
												size="large"
											/>
										)}
									/>
								</Form.Item>

								<Form.Item
									label="Chủ đề"
									validateStatus={errors.subject ? 'error' : ''}
									help={errors.subject?.message}
								>
									<Controller
										name="subject"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												placeholder="Nhập chủ đề"
												size="large"
											/>
										)}
									/>
								</Form.Item>

								<Form.Item
									label="Nội dung"
									validateStatus={errors.message ? 'error' : ''}
									help={errors.message?.message}
								>
									<Controller
										name="message"
										control={control}
										render={({ field }) => (
											<TextArea
												{...field}
												rows={6}
												placeholder="Nhập nội dung tin nhắn của bạn..."
												showCount
												maxLength={1000}
											/>
										)}
									/>
								</Form.Item>

								<Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										size="large"
										icon={<SendOutlined />}
										loading={isSubmitting}
										block
									>
										Gửi tin nhắn
									</Button>
								</Form.Item>
							</Form>
						</div>
					</div>

					<Divider />

					<div className="bg-gray-50 p-4 rounded-lg">
						<Title level={4}>Các chủ đề thường gặp</Title>
						<Paragraph>
							Trước khi gửi tin nhắn, bạn có thể tham khảo{' '}
							<a href="/guide" className="text-blue-600 hover:underline">
								trang hướng dẫn
							</a>{' '}
							để tìm câu trả lời cho các câu hỏi thường gặp.
						</Paragraph>
					</div>
				</Space>
			</Card>
		</div>
	);
};

export default ContactPage;

