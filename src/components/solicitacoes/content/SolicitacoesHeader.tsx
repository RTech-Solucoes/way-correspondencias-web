'use client';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import PageTitle from '@/components/ui/page-title';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';

interface SolicitacoesHeaderProps {
  totalElements: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export function SolicitacoesHeader({
  totalElements,
  currentPage,
  totalPages,
  loading,
  onRefresh,
  onPageChange,
}: SolicitacoesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <PageTitle />

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
        >
          <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
        </Button>

        <span className="text-sm text-gray-500">
          {totalElements} {totalElements > 1 ? "solicitações" : "solicitação"}
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
