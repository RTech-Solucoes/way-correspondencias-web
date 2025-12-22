'use client';

import { Button } from "@/components/ui/button";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Pagination } from "@/components/ui/pagination";

interface ObrigacoesHeaderProps {
  totalElements: number;
  loadObrigacoes: () => void;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function ObrigacoesHeader({
  totalElements,
  loadObrigacoes,
  loading,
  currentPage,
  totalPages,
  setCurrentPage,
}: ObrigacoesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold text-gray-900">Obrigações Contratuais</h1>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadObrigacoes()}
          disabled={loading}
          title="Atualizar lista"
        >
          <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
        </Button>

        <span className="text-sm text-gray-500">
          {totalElements} {totalElements !== 1 ? "obrigações" : "obrigação"}
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setCurrentPage}
          loading={loading}
          showOnlyPaginationButtons={true}
        />
      </div>
    </div>
  );
}

