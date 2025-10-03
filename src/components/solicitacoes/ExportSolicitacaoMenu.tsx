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

type ExportSolicitacaoMenuProps = {
  filterParams: Omit<SolicitacaoFilterParams, 'page' | 'size' | 'sort'>;
  getStatusText: (statusCode: string) => string | null;
  className?: string;
};

export default function ExportSolicitacaoMenu({ filterParams, getStatusText, className }: ExportSolicitacaoMenuProps) {
  const [runExcel, setRunExcel] = useState(false);
  const [runPdf, setRunPdf] = useState(false);

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
          <Button variant="secondary" className={`h-10 px-4 ${className || ''}`}>
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setRunExcel(true)}>
            Exportar em Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRunPdf(true)}>
            Exportar em PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {excelRunner}
      {pdfRunner}
    </>
  );
}


