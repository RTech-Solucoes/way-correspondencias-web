'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import { toast } from 'sonner';
import { PagedResponse, SolicitacaoFilterParams, SolicitacaoResponse } from '@/api/solicitacoes/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { formatDateTimeBrCompactExport } from '@/utils/utils';

type ExportSoliExceloesExcelnProps = {
  filterParams: Omit<SolicitacaoFilterParams, 'page' | 'size' | 'sort'>;
  getStatusText: (statusCode: string) => string | null;
  className?: string;
  onDone?: () => void;
};

export default function ExportSoliExceloesExcel({ filterParams, getStatusText, onDone }: ExportSoliExceloesExcelnProps) {
  const [, setExporting] = useState(false);
  const startedRef = useRef(false);

  const exportarExcel = useCallback(async () => {
    try {
      
      setExporting(true);

      const response = await solicitacoesClient.buscarPorFiltro({
        ...filterParams,
        page: 0,
        size: 10000,
      });

      const lista = (response && typeof response === 'object' && 'content' in response)
        ? (response as unknown as PagedResponse<SolicitacaoResponse>).content ?? []
        : (response as SolicitacaoResponse[]) ?? [];

      const headers = [
        'Identificação',
        'Assunto',
        'Áreas',
        'Tema',
        'Status',
        'Data Início Solicitação', 
        'Data Início Primeira Tramitação',
        'Data Prazo Limite Tramitação',
        'Data Conclusão Tramitação',
        'Atendido dentro do prazo'
      ];

      const escapeCell = (val?: string | number | null) => {
        if (val === null || val === undefined) return '';
        return String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\t|\n|\r/g, ' ');
      };

      const rows = lista.map((s) => {
        const areasNomes = (s.areas || s.area || [])
          .map((a) => a?.nmArea)
          .filter(Boolean)
          .join(', ');

        const tema = s.nmTema || s.tema?.nmTema || '';
        const status = s.statusSolicitacao?.nmStatus || getStatusText(s.statusCodigo?.toString() || '') || '';

        const dtInicio = s.dtCriacao ? new Date(s.dtCriacao).toLocaleString('pt-BR') : '';
        const dtPrimeira = s.dtPrimeiraTramitacao ? new Date(s.dtPrimeiraTramitacao).toLocaleString('pt-BR') : '';
        const dtPrazoLimite = s.dtPrazoLimite ? new Date(s.dtPrazoLimite).toLocaleString('pt-BR') : '';
        const dtConclusao = s.dtConclusaoTramitacao ? new Date(s.dtConclusaoTramitacao).toLocaleString('pt-BR') : '';

        let atendidoDentroDoPrazo = '-';
        if (s.dtConclusaoTramitacao && s.dtPrazoLimite) {
          const dtConclusaoDate = new Date(s.dtConclusaoTramitacao);
          const dtPrazoLimiteDate = new Date(s.dtPrazoLimite);
          atendidoDentroDoPrazo = dtConclusaoDate <= dtPrazoLimiteDate ? 'Sim' : 'Não';
        }

        return [
          escapeCell(s.cdIdentificacao || ''),
          escapeCell(s.dsAssunto || ''),
          escapeCell(areasNomes),
          escapeCell(tema),
          escapeCell(status),
          escapeCell(dtInicio),
          escapeCell(dtPrimeira),
          escapeCell(dtPrazoLimite),
          escapeCell(dtConclusao),
          escapeCell(atendidoDentroDoPrazo)
        ];
      });

      const tableHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1">${
        `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
      }</table></body></html>`;
      
      const blob = new Blob([`\ufeff${tableHtml}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solicitacoes_export_${formatDateTimeBrCompactExport()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Exportação realizada com sucesso');
    } catch {
      toast.error('Erro ao exportar solicitações');
    } finally {
      setExporting(false);
      onDone?.();
    }
  }, [filterParams, getStatusText, onDone]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    exportarExcel();
  }, [exportarExcel]);

  return null;
}