import { Card, Table, Tag, Avatar } from 'antd';
import { FileTextOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats.api';
import type { Resource } from '@/types/resource.types';
import type { ColumnsType } from 'antd/es/table';
import { formatFileSize, getRelativeTime } from '@/utils/format.utils';

interface RecentUploadsProps {
  limit?: number;
}

/**
 * Recent Uploads Component
 * Hiển thị danh sách học liệu được tải lên gần đây
 */
export const RecentUploads: React.FC<RecentUploadsProps> = ({ limit = 10 }) => {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['stats', 'recent-uploads', limit],
    queryFn: () => statsApi.getRecentUploads(limit),
  });

  const columns: ColumnsType<Resource> = [
    {
      title: 'Học liệu',
      key: 'resource',
      render: (_, record) => (
        <div>
          <div className="font-semibold flex items-center gap-2">
            <FileTextOutlined />
            {record.title}
          </div>
          {record.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
              {record.description}
            </div>
          )}
          {record.type && (
            <Tag color="blue" className="mt-1">
              {record.type.name}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Người tải lên',
      key: 'uploadedBy',
      width: 200,
      render: (_, record) =>
        record.uploadedBy ? (
          <div className="flex items-center gap-2">
            <Avatar icon={<UserOutlined />} size="small" />
            <span>{record.uploadedBy.fullName}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Trạng thái',
      key: 'approvalStatus',
      width: 120,
      render: (_, record) => {
        const statusMap = {
          PENDING: { color: 'orange', text: 'Chờ duyệt' },
          APPROVED: { color: 'green', text: 'Đã duyệt' },
          REJECTED: { color: 'red', text: 'Từ chối' },
        };
        const status = statusMap[record.approvalStatus] || statusMap.PENDING;
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Kích thước',
      key: 'size',
      align: 'right',
      width: 100,
      render: (_, record) =>
        record.sizeBytes ? (
          <span className="text-sm text-gray-500">
            {formatFileSize(record.sizeBytes)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Thời gian',
      key: 'createdAt',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <ClockCircleOutlined />
          <span>{getRelativeTime(record.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <span>Uploads Gần Đây</span>
        </div>
      }
      loading={isLoading}
    >
      <Table
        columns={columns}
        dataSource={resources}
        rowKey="id"
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

