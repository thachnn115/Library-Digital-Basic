import { Card, Table, Select } from 'antd';
import { FileTextOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { statsApi } from '@/api/stats.api';
import type { TopResourceResponse } from '@/types/stats.types';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber, formatFileSize } from '@/utils/format.utils';

interface TopResourcesProps {
  defaultSort?: 'views' | 'downloads' | 'combined';
  limit?: number;
}

/**
 * Top Resources Component
 * Hiển thị danh sách học liệu phổ biến nhất
 */
export const TopResources: React.FC<TopResourcesProps> = ({
  defaultSort = 'views',
  limit = 5,
}) => {
  const [sort, setSort] = useState<'views' | 'downloads' | 'combined'>(defaultSort);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['stats', 'top-resources', sort, limit],
    queryFn: () => statsApi.getTopResources(sort, limit),
  });

  const columns: ColumnsType<TopResourceResponse> = [
    {
      title: 'Học liệu',
      key: 'resource',
      render: (_, record) => (
        <div>
          <div className="font-semibold flex items-center gap-2">
            <FileTextOutlined />
            {record.resource.title}
          </div>
          {record.resource.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
              {record.resource.description}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {record.resource.uploadedBy?.fullName && (
              <span>Bởi {record.resource.uploadedBy.fullName}</span>
            )}
            {record.resource.type && (
              <span className="ml-2">
                • {record.resource.type.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Lượt xem',
      key: 'views',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <EyeOutlined className="text-gray-400" />
          <span className="font-semibold">{formatNumber(record.views)}</span>
        </div>
      ),
    },
    {
      title: 'Lượt tải',
      key: 'downloads',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <DownloadOutlined className="text-gray-400" />
          <span className="font-semibold">{formatNumber(record.downloads)}</span>
        </div>
      ),
    },
    {
      title: 'Kích thước',
      key: 'size',
      align: 'right',
      width: 100,
      render: (_, record) =>
        record.resource.sizeBytes ? (
          <span className="text-sm text-gray-500">
            {formatFileSize(record.resource.sizeBytes)}
          </span>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span>Top Học Liệu</span>
          </div>
          <Select
            value={sort}
            onChange={setSort}
            style={{ width: 150 }}
            options={[
              { label: 'Theo lượt xem', value: 'views' },
              { label: 'Theo lượt tải', value: 'downloads' },
              { label: 'Tổng hợp', value: 'combined' },
            ]}
          />
        </div>
      }
      loading={isLoading}
    >
      <Table
        columns={columns}
        dataSource={resources}
        rowKey={(record) => record.resource.id}
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

