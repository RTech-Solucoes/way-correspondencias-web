import React from 'react';
import { Button } from '@/components/ui/button';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  loading = false
}: PaginationProps) {
  const safePage = Number.isInteger(currentPage) && currentPage >= 0 ? currentPage : 0;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const safeTotalElements = Number.isInteger(totalElements) && totalElements >= 0 ? totalElements : 0;
  const safeTotalPages = Number.isInteger(totalPages) && totalPages >= 0 ? totalPages : 0;

  const startItem = safeTotalElements > 0 ? (safePage * safePageSize) + 1 : 0;
  const endItem = safeTotalElements > 0 ? Math.min((safePage + 1) * safePageSize, safeTotalElements) : 0;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(0, safePage - delta);
      i <= Math.min(safeTotalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, '...');
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range[range?.length - 1] < safeTotalPages - 1) {
      if (range[range?.length - 1] < safeTotalPages - 2) {
        rangeWithDots.push('...', safeTotalPages - 1);
      } else {
        rangeWithDots.push(safeTotalPages - 1);
      }
    }

    return rangeWithDots;
  };

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Mostrando {startItem} a {endItem} de {safeTotalElements} resultados
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 0 || loading}
          className="p-2"
        >
          <CaretLeftIcon className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                variant={safePage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={loading}
                className="min-w-[32px]"
              >
                {(page as number) + 1}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages - 1 || loading}
          className="p-2"
        >
          <CaretRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
