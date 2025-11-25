'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import { toast } from 'sonner';
import { ObrigacaoFiltroRequest, ObrigacaoResponse } from '@/api/obrigacao/types';
import obrigacaoClient, { PaginatedResponse } from '@/api/obrigacao/client';
import { formatDateTimeBrCompactExport, formatDateBr, formatDateTimeBr } from '@/utils/utils';
import { TipoEnum } from '@/api/tipos/types';

// Função auxiliar para buscar o comentário mais recente de uma obrigação
async function buscarComentarioMaisRecente(idSolicitacao: number): Promise<string> {
  try {
    const detalhe = await obrigacaoClient.buscarDetalhePorId(idSolicitacao);
    
    const comentarios: Array<{
      texto: string;
      data: string;
    }> = [];

    // Adicionar comentários de pareceres
    if (detalhe.solicitacaoParecer) {
      detalhe.solicitacaoParecer.forEach(parecer => {
        if (parecer.dsDarecer) {
          comentarios.push({
            texto: parecer.dsDarecer,
            data: parecer.dtCriacao || ''
          });
        }
      });
    }

    // Adicionar comentários de tramitações
    if (detalhe.tramitacoes) {
      detalhe.tramitacoes.forEach(tramitacao => {
        if (tramitacao.dsObservacao) {
          const dataTramitacao = tramitacao.tramitacaoAcao?.[0]?.dtCriacao || 
                                tramitacao.solicitacao?.dtCriacao || 
                                '';
          comentarios.push({
            texto: tramitacao.dsObservacao,
            data: dataTramitacao
          });
        }
      });
    }

    // Ordenar por data decrescente e pegar o primeiro
    if (comentarios.length === 0) return '';

    comentarios.sort((a, b) => {
      const dataA = a.data ? new Date(a.data).getTime() : 0;
      const dataB = b.data ? new Date(b.data).getTime() : 0;
      if (isNaN(dataA) && isNaN(dataB)) return 0;
      if (isNaN(dataA)) return 1;
      if (isNaN(dataB)) return -1;
      return dataB - dataA; // Ordem decrescente
    });

    return comentarios[0].texto || '';
  } catch (error) {
    console.error(`Erro ao buscar comentário para obrigação ${idSolicitacao}:`, error);
    return '';
  }
}

type ExportObrigacoesExcelProps = {
  filterParams: Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'>;
  getStatusText: (statusCode: string) => string | null;
  isAdminOrGestor: boolean;
  className?: string;
  onDone?: () => void;
};

export default function ExportObrigacoesExcel({ filterParams, getStatusText, isAdminOrGestor, onDone }: ExportObrigacoesExcelProps) {
  const [, setExporting] = useState(false);
  const startedRef = useRef(false);

  const exportarExcel = useCallback(async () => {
    try {
      
      setExporting(true);

      const response = await obrigacaoClient.buscarLista({
        ...filterParams,
        page: 0,
        size: 10000,
      });

      const lista = (response && typeof response === 'object' && 'content' in response)
        ? (response as PaginatedResponse<ObrigacaoResponse>).content ?? []
        : (response as ObrigacaoResponse[]) ?? [];

      const headers = [
        'Identificação',
        'Tarefa',
        'Tema',
        'Status',
        'Área Atribuída',
        'Data de Início',
        'Data de Término',
        ...(isAdminOrGestor ? ['Data Limite'] : []),
        'Data de Conclusão',
        'Classificação',
        'Periodicidade',
        'Obrigação Principal',
        ...(isAdminOrGestor ? ['Enviado para Áreas'] : []),
        'Comentário Mais Recente',
        'Justificativa de Atraso',
        'Data Justificativa de Atraso',
        'Responsável Justificativa de Atraso'
      ];

      const escapeCell = (val?: string | number | null) => {
        if (val === null || val === undefined) return '';
        return String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\t|\n|\r/g, ' ');
      };

      // Buscar comentários mais recentes para todas as obrigações em paralelo
      const comentariosMap = new Map<number, string>();
      const comentariosPromises = lista.map(async (o) => {
        if (o.idSolicitacao) {
          const comentario = await buscarComentarioMaisRecente(o.idSolicitacao);
          comentariosMap.set(o.idSolicitacao, comentario);
        }
      });
      
      await Promise.all(comentariosPromises);

      const rows = lista.map((o) => {
        const areaAtribuida = o.areas?.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA)?.nmArea || '';
        const tema = o.tema?.nmTema || '';
        const status = o.statusSolicitacao?.nmStatus || getStatusText(o.statusSolicitacao?.idStatusSolicitacao?.toString() || '') || '';
        const classificacao = o.tipoClassificacao?.dsTipo || '';
        const periodicidade = o.tipoPeriodicidade?.dsTipo || '';
        const enviadoParaAreas = o.flEnviandoArea === 'S' ? 'Sim' : 'Não';
        
        // Obrigação Principal - mostrar ID quando for condicionada
        const obrigacaoPrincipal = o.obrigacaoPrincipal?.idSolicitacao 
          ? o.obrigacaoPrincipal.cdIdentificacao || o.obrigacaoPrincipal.idSolicitacao.toString()
          : '';
        
        // Comentário Mais Recente
        const comentarioMaisRecente = o.idSolicitacao ? comentariosMap.get(o.idSolicitacao) || '' : '';
        
        // Justificativa de Atraso
        const justificativaAtraso = o.dsJustificativaAtraso || '';
        const dtJustificativaAtraso = o.dtJustificativaAtraso ? formatDateBr(o.dtJustificativaAtraso) : '';
        const responsavelJustifAtraso = o.responsavelJustifAtraso?.nmResponsavel || '';

        const dtInicio = o.dtInicio ? formatDateBr(o.dtInicio) : '';
        const dtTermino = o.dtTermino ? formatDateBr(o.dtTermino) : '';
        const dtLimite = o.dtLimite ? formatDateBr(o.dtLimite) : '';
        const dtConclusao = o.dtConclusaoTramitacao ? formatDateTimeBr(o.dtConclusaoTramitacao) : '';

        const row = [
          escapeCell(o.cdIdentificacao || ''),
          escapeCell(o.dsTarefa || ''),
          escapeCell(tema),
          escapeCell(status),
          escapeCell(areaAtribuida),
          escapeCell(dtInicio),
          escapeCell(dtTermino),
          ...(isAdminOrGestor ? [escapeCell(dtLimite)] : []),
          escapeCell(dtConclusao),
          escapeCell(classificacao),
          escapeCell(periodicidade),
          escapeCell(obrigacaoPrincipal),
          ...(isAdminOrGestor ? [escapeCell(enviadoParaAreas)] : []),
          escapeCell(comentarioMaisRecente),
          escapeCell(justificativaAtraso),
          escapeCell(dtJustificativaAtraso),
          escapeCell(responsavelJustifAtraso)
        ];
        
        return row;
      });

      const tableHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1">${
        `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
      }</table></body></html>`;
      
      const blob = new Blob([`\ufeff${tableHtml}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `obrigacoes_export_${formatDateTimeBrCompactExport()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Exportação realizada com sucesso');
    } catch {
      toast.error('Erro ao exportar obrigações');
    } finally {
      setExporting(false);
      onDone?.();
    }
  }, [filterParams, getStatusText, isAdminOrGestor, onDone]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    exportarExcel();
  }, [exportarExcel]);

  return null;
}

