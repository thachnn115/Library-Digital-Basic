import { Card, Progress, Statistic, Row, Col } from 'antd';
import { DatabaseOutlined, CloudOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats.api';
import { formatFileSize } from '@/utils/format.utils';

/**
 * Storage Usage Component
 * Hiển thị tổng dung lượng lưu trữ đã sử dụng (chỉ ADMIN)
 */
export const StorageUsage: React.FC = () => {
  const { data: totalBytes = 0, isLoading } = useQuery({
    queryKey: ['stats', 'storage-usage'],
    queryFn: () => statsApi.getStorageUsage(),
  });

  // Giả định tổng dung lượng tối đa (có thể lấy từ config)
  const MAX_STORAGE_BYTES = 100 * 1024 * 1024 * 1024; // 100 GB
  const usagePercent = (totalBytes / MAX_STORAGE_BYTES) * 100;
  const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - totalBytes);

  const getStatusColor = (percent: number): string => {
    if (percent >= 90) return '#ff4d4f';
    if (percent >= 70) return '#faad14';
    return '#52c41a';
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <DatabaseOutlined />
          <span>Sử Dụng Lưu Trữ</span>
        </div>
      }
      loading={isLoading}
    >
      <div className="space-y-4">
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="Đã sử dụng"
              value={formatFileSize(totalBytes)}
              prefix={<CloudOutlined />}
              valueStyle={{ color: getStatusColor(usagePercent) }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="Còn lại"
              value={formatFileSize(remainingBytes)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title="Tổng dung lượng"
              value={formatFileSize(MAX_STORAGE_BYTES)}
            />
          </Col>
        </Row>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Mức độ sử dụng</span>
            <span
              className="text-sm font-semibold"
              style={{ color: getStatusColor(usagePercent) }}
            >
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <Progress
            percent={usagePercent}
            strokeColor={getStatusColor(usagePercent)}
            showInfo={false}
            status={usagePercent >= 90 ? 'exception' : 'active'}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 GB</span>
            <span>{formatFileSize(MAX_STORAGE_BYTES)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

