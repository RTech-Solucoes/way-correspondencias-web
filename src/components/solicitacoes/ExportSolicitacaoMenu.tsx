'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CloudArrowDownIcon } from '@phosphor-icons/react';
import ExportSolicitacoesExcel from '@/components/solicitacoes/ExportSolicitacoesExcel';
import ExportSolicitacoesPdf from '@/components/solicitacoes/ExportSolicitacoesPdf';
import { SolicitacaoFilterParams } from '@/api/solicitacoes/types';
import LoadingOverlay from '@/components/ui/loading-overlay';

type ExportSolicitacaoMenuProps = {
  filterParams: Omit<SolicitacaoFilterParams, 'page' | 'size'>;
  getStatusText: (statusCode: string) => string | null;
  className?: string;
};

export default function ExportSolicitacaoMenu({ filterParams, getStatusText, className }: ExportSolicitacaoMenuProps) {
  const [runExcel, setRunExcel] = useState(false);
  const [runPdf, setRunPdf] = useState(false);

  const isLoading = runExcel || runPdf;

  const excelRunner = useMemo(() => (
    runExcel ? (
      <ExportSolicitacoesExcel
        filterParams={filterParams}
        getStatusText={getStatusText}
        onDone={() => setRunExcel(false)}
      />
    ) : null
  ), [runExcel, filterParams, getStatusText]);

  const pdfRunner = useMemo(() => (
    runPdf ? (
      <ExportSolicitacoesPdf
        filterParams={filterParams}
        getStatusText={getStatusText}
        onDone={() => setRunPdf(false)}
      />
    ) : null
  ), [runPdf, filterParams, getStatusText]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className={`h-10 px-4 ${className || ''}`} disabled={isLoading}>
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setRunExcel(true)} disabled={isLoading}>
            Exportar em Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRunPdf(true)} disabled={isLoading}>
            Exportar em PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isLoading && (
        <LoadingOverlay
          title={runPdf ? 'Gerando PDF...' : 'Gerando Excel...'}
          subtitle="Aguarde enquanto o relatório é processado"
        />
      )}

      {excelRunner}
      {pdfRunner}
    </>
  );
}


