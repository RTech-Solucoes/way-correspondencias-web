import React from 'react';
import {Button} from '@/components/ui/button';
import {CaretLeftIcon, CaretRightIcon} from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showOnlyPaginationButtons?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  loading = false,
  showOnlyPaginationButtons = false
}: PaginationProps) {
  const first = currentPage === 0;
  const last = currentPage === totalPages - 1;

  const showBackButton = !first && totalPages > 1
  const showNextButton = !last && totalPages > 1

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(0, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range.length > 0 && range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, '...');
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range.length > 0 && range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push('...', totalPages - 1);
      } else {
        rangeWithDots.push(totalPages - 1);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {!showOnlyPaginationButtons && (
        <div className="text-sm text-gray-700">
          {totalElements} Resultados Encontrados
        </div>
      )}

      <div className="flex items-center space-x-1">
        {showBackButton &&
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={loading}
            className="p-2"
          >
            <CaretLeftIcon className="h-4 w-4" />
          </Button>
        }

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
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

        {showNextButton &&
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={loading}
            className="p-2"
          >
            <CaretRightIcon className="h-4 w-4" />
          </Button>
        }
      </div>
    </div>
  );
}
