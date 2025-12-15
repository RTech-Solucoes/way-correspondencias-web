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
import ExportObrigacoesExcel from '@/components/obrigacoes/relatorios/ExportObrigacoesExcel';
import ExportObrigacoesPdf from '@/components/obrigacoes/relatorios/ExportObrigacoesPdf';
import { ObrigacaoFiltroRequest } from '@/api/obrigacao/types';
import LoadingOverlay from '@/components/ui/loading-overlay';

type ExportObrigacaoMenuProps = {
  filterParams: Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'>;
  getStatusText: (statusCode: string) => string | null;
  isAdminOrGestor: boolean;
  className?: string;
};

export default function ExportObrigacaoMenu({ filterParams, getStatusText, isAdminOrGestor, className }: ExportObrigacaoMenuProps) {
  const [runExcel, setRunExcel] = useState(false);
  const [runPdf, setRunPdf] = useState(false);

  const excelRunner = useMemo(() => (
    runExcel ? (
      <ExportObrigacoesExcel
        filterParams={filterParams}
        getStatusText={getStatusText}
        isAdminOrGestor={isAdminOrGestor}
        onDone={() => setRunExcel(false)}
      />
    ) : null
  ), [runExcel, filterParams, getStatusText, isAdminOrGestor]);

  const pdfRunner = useMemo(() => (
    runPdf ? (
      <ExportObrigacoesPdf
        filterParams={filterParams}
        getStatusText={getStatusText}
        isAdminOrGestor={isAdminOrGestor}
        onDone={() => setRunPdf(false)}
      />
    ) : null
  ), [runPdf, filterParams, getStatusText, isAdminOrGestor]);

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
      
      {(runExcel || runPdf) && (
        <LoadingOverlay 
          title={runExcel ? "Exportando Excel..." : "Exportando PDF..."} 
          subtitle="Aguarde enquanto os dados são processados e o arquivo é gerado" 
        />
      )}
    </>
  );
}

