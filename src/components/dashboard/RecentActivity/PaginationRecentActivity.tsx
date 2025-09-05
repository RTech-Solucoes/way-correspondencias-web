import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface PaginationRecentActivityProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function PaginationRecentActivity({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  loading = false
}: PaginationRecentActivityProps) {
  const first = currentPage === 0;
  const last = currentPage === totalPages - 1;
  const showBackButton = !first && totalPages > 1;
  const showNextButton = !last && totalPages > 1;

  const startItem = currentPage * 10 + 1;
  const endItem = Math.min((currentPage + 1) * 10, totalElements);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="text-sm text-gray-600">
        {startItem}-{endItem} de {totalElements}
      </div>

      <div className="flex items-center space-x-2 gap-2">
        {showBackButton && (
          <CaretLeftIcon
            className="h-4 w-4 cursor-pointer"
            onClick={() => onPageChange(currentPage - 1)}
          />
        )}

        {showNextButton && (
          <CaretRightIcon className="h-4 w-4 cursor-pointer" onClick={() => onPageChange(currentPage + 1)} />
        )}
      </div>
    </div >
  );
}