import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PaginationTasksStatusProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function PaginationTasksStatus({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  loading = false
}: PaginationTasksStatusProps) {
  const first = currentPage === 0;
  const last = currentPage === totalPages - 1;
  const showBackButton = !first && totalPages > 1;
  const showNextButton = !last && totalPages > 1;

  const startItem = currentPage * 5 + 1;
  const endItem = Math.min((currentPage + 1) * 5, totalElements);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="text-sm text-gray-600">
        {startItem}-{endItem} de {totalElements}
      </div>

      <div className="flex items-center space-x-2 gap-2">
        {showBackButton && (
          <CaretLeftIcon
            className="h-4 w-4 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onPageChange(currentPage - 1)}
          />
        )}

        {showNextButton && (
          <CaretRightIcon
            className="h-4 w-4 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onPageChange(currentPage + 1)}
          />
        )}
      </div>
    </div>
  );
}
