'use client';

import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';

interface ConcessionariasHeaderProps {
  totalElements: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export default function ConcessionariasHeader({
  totalElements,
  currentPage,
  totalPages,
  loading,
  onRefresh,
  onPageChange,
}: ConcessionariasHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <PageTitle />

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          tooltip="Atualizar"
        >
          <ArrowClockwiseIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        <span className="text-sm text-gray-500">
          {totalElements} {totalElements === 1 ? 'concessionária' : 'concessionárias'}
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
  );
}
