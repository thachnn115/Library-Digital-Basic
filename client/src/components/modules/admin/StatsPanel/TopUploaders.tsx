import { Card, Table, Avatar, Tag } from 'antd';
import { UserOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats.api';
import type { TopUploaderResponse } from '@/types/stats.types';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber } from '@/utils/format.utils';

interface TopUploadersProps {
  limit?: number;
}

/**
 * Top Uploaders Component
 * Hiển thị danh sách người dùng tải lên nhiều học liệu nhất
 */
export const TopUploaders: React.FC<TopUploadersProps> = ({ limit = 5 }) => {
  const { data: uploaders = [], isLoading } = useQuery({
    queryKey: ['stats', 'top-uploaders', limit],
    queryFn: () => statsApi.getTopUploaders(limit),
  });

  const columns: ColumnsType<TopUploaderResponse> = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, __, index) => {
        const rank = index + 1;
        const color =
          rank === 1 ? 'gold' : rank === 2 ? 'default' : rank === 3 ? 'orange' : undefined;
        return (
          <div className="flex items-center justify-center">
            {rank <= 3 ? (
              <TrophyOutlined style={{ fontSize: 20, color: color === 'gold' ? '#FFD700' : color === 'orange' ? '#FF8C00' : '#C0C0C0' }} />
            ) : (
              <span className="font-semibold">{rank}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size="large" />
          <div>
            <div className="font-semibold">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
            {record.departmentName && (
              <div className="text-xs text-gray-400">{record.departmentName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng tải lên',
      key: 'uploadCount',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <Tag color="blue" className="text-base font-semibold">
          {formatNumber(record.uploadCount)}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined />
          <span>Top Người Tải Lên</span>
        </div>
      }
      loading={isLoading}
    >
      <Table
        columns={columns}
        dataSource={uploaders}
        rowKey="userId"
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

