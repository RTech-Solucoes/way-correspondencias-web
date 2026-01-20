import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Button } from '@nextui-org/react';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';

interface HeaderTemaProps {
  totalElements: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export default function HeaderTema({
  totalElements,
  currentPage,
  totalPages,
  loading,
  onRefresh,
  onPageChange,
}: HeaderTemaProps) {
  return (
    <div className="flex items-center justify-between">
      <PageTitle />

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <ArrowClockwiseIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalElements} {totalElements > 1 ? "temas" : "tema"}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={onPageChange}
            loading={loading}
            showOnlyPaginationButtons={true}
          />
        </div>
      </div>
    </div>
  );
}
