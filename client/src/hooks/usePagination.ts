import { useState } from 'react';
import { APP_CONFIG } from '@/constants/app-config';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
  getOffset: () => number;
}

export const usePagination = ({
  initialPage = 0,
  initialPageSize = APP_CONFIG.DEFAULT_PAGE_SIZE,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const resetPagination = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  };

  const getOffset = () => {
    return page * pageSize;
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPagination,
    getOffset,
  };
};

