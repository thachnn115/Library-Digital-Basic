import { Card, Collapse, Typography, Space, Divider } from 'antd';
import {
	QuestionCircleOutlined,
	FileTextOutlined,
	SearchOutlined,
	UploadOutlined,
	FolderOpenOutlined,
	UserOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * Guide Page - Hướng dẫn sử dụng hệ thống
 */
const GuidePage: React.FC = () => {
	const faqItems = [
		{
			key: '1',
			label: 'Làm thế nào để tìm kiếm học liệu?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Bạn có thể tìm kiếm học liệu theo 2 cách:
					</Paragraph>
					<ol className="list-decimal list-inside space-y-1 ml-4">
						<li>
							<Text strong>Tìm kiếm nâng cao:</Text> Sử dụng từ khóa và các bộ
							lọc như chương trình đào tạo, chuyên ngành, khóa, lớp, giảng viên,
							loại học liệu.
						</li>
						<li>
							<Text strong>Tìm kiếm theo thư mục:</Text> Trong trang "Tìm kiếm học liệu", bạn có thể duyệt theo cấu trúc thư mục từ
							Chương trình đào tạo → Chuyên ngành → Học phần → Giảng viên →
							Lớp bằng cách click vào các folder.
						</li>
					</ol>
				</div>
			),
		},
		{
			key: '2',
			label: 'Các loại file nào được hỗ trợ upload?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Hệ thống hỗ trợ các định dạng file sau:
					</Paragraph>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>Tài liệu: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</li>
						<li>Hình ảnh: JPG, PNG, GIF</li>
						<li>Video: MP4</li>
					</ul>
					<Paragraph className="mt-2">
						<Text strong>Lưu ý:</Text> Kích thước file tối đa là 100MB. Các file
						DOCX và PPTX sẽ được tự động chuyển đổi sang PDF.
					</Paragraph>
				</div>
			),
		},
		{
			key: '3',
			label: 'Quy trình upload học liệu như thế nào?',
			children: (
				<div className="space-y-2">
					<Paragraph>Quy trình upload gồm 3 bước:</Paragraph>
					<ol className="list-decimal list-inside space-y-1 ml-4">
						<li>
							<Text strong>Chọn thư mục:</Text> Chọn lớp và học phần để lưu học
							liệu.
						</li>
						<li>
							<Text strong>Upload file:</Text> Kéo thả hoặc chọn file từ máy tính.
						</li>
						<li>
							<Text strong>Nhập thông tin:</Text> Điền tên học liệu và chọn loại học
							liệu.
						</li>
					</ol>
					<Paragraph className="mt-2">
						Sau khi upload, học liệu sẽ ở trạng thái "Chờ duyệt" và cần được Admin
						phê duyệt trước khi hiển thị công khai.
					</Paragraph>
				</div>
			),
		},
		{
			key: '4',
			label: 'Làm thế nào để xem và tải xuống học liệu?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Sau khi tìm thấy học liệu, bạn có thể:
					</Paragraph>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>
							<Text strong>Xem trực tuyến:</Text> Click vào nút "Xem" để xem file
							PDF, hình ảnh hoặc video ngay trên trình duyệt.
						</li>
						<li>
							<Text strong>Tải xuống:</Text> Click vào nút "Tải xuống" để lưu file
							về máy tính.
						</li>
					</ul>
					<Paragraph className="mt-2">
						Lịch sử xem và tải xuống sẽ được lưu trong phần "Học liệu của tôi".
					</Paragraph>
				</div>
			),
		},
		{
			key: '5',
			label: 'Tôi có thể chỉnh sửa hoặc xóa học liệu đã upload không?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Có, bạn có thể quản lý học liệu của mình trong trang "Học liệu của tôi":
					</Paragraph>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>
							<Text strong>Chỉnh sửa:</Text> Thay đổi tên, loại học liệu (nếu học
							liệu chưa được duyệt).
						</li>
						<li>
							<Text strong>Xóa:</Text> Xóa học liệu khỏi hệ thống (chỉ có thể xóa
							học liệu của chính bạn).
						</li>
					</ul>
					<Paragraph className="mt-2">
						<Text strong>Lưu ý:</Text> Học liệu đã được duyệt có thể không thể chỉnh
						sửa một số thông tin.
					</Paragraph>
				</div>
			),
		},
		{
			key: '6',
			label: 'Học liệu của tôi bị từ chối, tôi cần làm gì?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Khi học liệu bị từ chối, bạn sẽ nhận được thông báo. Bạn có thể:
					</Paragraph>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>Kiểm tra lý do từ chối trong phần "Học liệu của tôi"</li>
						<li>Chỉnh sửa và upload lại học liệu</li>
						<li>Liên hệ Admin nếu cần hỗ trợ thêm</li>
					</ul>
				</div>
			),
		},
		{
			key: '7',
			label: 'Làm thế nào để đổi mật khẩu và PIN?',
			children: (
				<div className="space-y-2">
					<Paragraph>
						Bạn có thể đổi mật khẩu và PIN trong trang "Hồ sơ cá nhân":
					</Paragraph>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>Click vào menu người dùng ở góc trên bên phải</li>
						<li>Chọn "Hồ sơ cá nhân"</li>
						<li>Vào tab "Bảo mật" để đổi mật khẩu và PIN</li>
					</ul>
					<Paragraph className="mt-2">
						<Text strong>Lưu ý:</Text> Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ
						hoa, chữ thường, số và ký tự đặc biệt.
					</Paragraph>
				</div>
			),
		},
	];

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Card>
				<Space direction="vertical" size="large" className="w-full">
					<div>
						<Title level={1} className="flex items-center gap-2">
							<QuestionCircleOutlined className="text-blue-500" />
							Hướng dẫn sử dụng
						</Title>
						<Paragraph className="text-gray-600">
							Hướng dẫn chi tiết về cách sử dụng hệ thống quản trị học liệu điện tử
						</Paragraph>
					</div>

					<Divider />

					<div>
						<Title level={2} className="flex items-center gap-2">
							<FileTextOutlined className="text-green-500" />
							Tổng quan hệ thống
						</Title>
						<Paragraph>
							Hệ thống quản trị học liệu điện tử giúp giảng viên quản lý, chia sẻ
							và tìm kiếm học liệu một cách hiệu quả. Hệ thống hỗ trợ:
						</Paragraph>
						<ul className="list-disc list-inside space-y-2 ml-4 mt-4">
							<li>
								<Text strong>Tìm kiếm nâng cao:</Text> Tìm kiếm học liệu theo nhiều
								tiêu chí khác nhau
							</li>
							<li>
								<Text strong>Tìm kiếm theo thư mục:</Text> Duyệt học liệu theo cấu trúc
								thư mục có tổ chức trong trang "Tìm kiếm học liệu"
							</li>
							<li>
								<Text strong>Upload học liệu:</Text> Tải lên và quản lý học liệu của
								bạn
							</li>
							<li>
								<Text strong>Theo dõi lịch sử:</Text> Xem lịch sử xem, tải xuống và
								upload
							</li>
						</ul>
					</div>

					<Divider />

					<div>
						<Title level={2} className="flex items-center gap-2">
							<SearchOutlined className="text-purple-500" />
							Các tính năng chính
						</Title>
						<Space direction="vertical" size="middle" className="w-full mt-4">
							<Card size="small" className="bg-blue-50">
								<Title level={4} className="flex items-center gap-2">
									<SearchOutlined />
									Tìm kiếm học liệu
								</Title>
								<Paragraph>
									Sử dụng từ khóa và các bộ lọc để tìm kiếm học liệu một cách
									nhanh chóng và chính xác.
								</Paragraph>
							</Card>

							<Card size="small" className="bg-green-50">
								<Title level={4} className="flex items-center gap-2">
									<FolderOpenOutlined />
									Tìm kiếm theo thư mục
								</Title>
								<Paragraph>
									Trong trang "Tìm kiếm học liệu", bạn có thể duyệt học liệu theo cấu trúc thư mục từ Chương trình đào tạo
									đến Lớp học bằng cách click vào các folder.
								</Paragraph>
							</Card>

							<Card size="small" className="bg-orange-50">
								<Title level={4} className="flex items-center gap-2">
									<UploadOutlined />
									Upload học liệu
								</Title>
								<Paragraph>
									Tải lên học liệu mới với giao diện kéo thả đơn giản và trực
									quan.
								</Paragraph>
							</Card>

							<Card size="small" className="bg-purple-50">
								<Title level={4} className="flex items-center gap-2">
									<UserOutlined />
									Quản lý cá nhân
								</Title>
								<Paragraph>
									Xem và quản lý học liệu của bạn, lịch sử xem và tải xuống.
								</Paragraph>
							</Card>
						</Space>
					</div>

					<Divider />

					<div>
						<Title level={2} className="flex items-center gap-2">
							<QuestionCircleOutlined className="text-red-500" />
							Câu hỏi thường gặp (FAQ)
						</Title>
						<Collapse
							className="mt-4"
							defaultActiveKey={['1']}
						>
							{faqItems.map((item) => (
								<Collapse.Panel key={item.key} header={item.label}>
									{item.children}
								</Collapse.Panel>
							))}
						</Collapse>
					</div>

					<Divider />

					<div className="bg-blue-50 p-4 rounded-lg">
						<Title level={4}>Cần hỗ trợ thêm?</Title>
						<Paragraph>
							Nếu bạn có câu hỏi hoặc gặp vấn đề khi sử dụng hệ thống, vui lòng{' '}
							<a href="/contact" className="text-blue-600 hover:underline">
								liên hệ với chúng tôi
							</a>
							.
						</Paragraph>
					</div>
				</Space>
			</Card>
		</div>
	);
};

export default GuidePage;

