'use client';

import {useEffect, useState} from 'react';
import {tramitacoesClient} from '@/api/tramitacoes/client';
import {AreaResponse} from '@/api/areas/types';
import {ArrowRight, ArrowRightIcon, SpinnerIcon} from '@phosphor-icons/react';
import {toast} from 'sonner';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import { formatDateTime } from '@/utils/utils';
import { solicitacaoParecerClient } from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { statusSolicitacaoClient } from '@/api/status-solicitacao/client';
import {Badge} from '@/components/ui/badge';

interface TramitacaoModalProps {
  idSolicitacao: number | null;
  open: boolean;
  onClose: () => void;
  areas: AreaResponse[];
}

export default function TramitacaoModal({ 
  idSolicitacao, 
  open, 
  onClose, 
}: TramitacaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<Array<{
    type: 'TRAMITACAO' | 'PARECER';
    id: number;
    descricao: string;
    statusId?: number;
    statusName?: string;
    responsavelNome?: string;
    responsavelPerfil?: number;
    dataISO?: string;
    nivel?: number;
    areaOrigem?: string | null;
    areaDestino?: string | null;
  }>>([]);

  useEffect(() => {
    const loadDados = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const [trams, pareceres, statuses] = await Promise.all([
          tramitacoesClient.listarPorSolicitacao(idSolicitacao),
          solicitacaoParecerClient.buscarPorIdSolicitacao(idSolicitacao),
          statusSolicitacaoClient.listarTodos(),
        ]);

        const statusMap = new Map<number, string>((statuses || []).map(s => [s.idStatusSolicitacao, s.nmStatus]));

        const tramItems = (trams || []).map((t) => {
          const acao = t?.tramitacaoAcao && t.tramitacaoAcao.length > 0 ? t.tramitacaoAcao[0] : undefined;
          const responsavelNome = acao?.responsavelArea?.responsavel?.nmResponsavel || 'Responsável não informado';
          const dataISO = acao?.dtCriacao;
          const statusId = t?.solicitacao?.statusSolicitacao?.idStatusSolicitacao;
          const statusName = statusId != null ? statusMap.get(statusId) : t?.solicitacao?.statusSolicitacao?.nmStatus;
          const descricao = t?.dsObservacao || '';
          const areaOrigem = t?.areaOrigem?.nmArea;
          const areaDestino = t?.areaDestino?.nmArea;
          return {
            type: 'TRAMITACAO' as const,
            id: t.idTramitacao,
            descricao,
            statusId,
            statusName,
            responsavelNome,
            dataISO,
            areaOrigem,
            areaDestino,
          };
        });

        const parecerItems = (pareceres || []).map((p: SolicitacaoParecerResponse) => {
          const responsavelNome = p?.responsavel?.nmResponsavel;
          const responsavelPerfil = p?.responsavel?.idPerfil as number | undefined;
          const areaNome = p?.responsavel?.areas && p.responsavel.areas.length > 0 ? p.responsavel.areas[0]?.area?.nmArea : undefined;
          const dataISO = p?.dtCriacao;
          const statusId = p?.idStatusSolicitacao;
          const statusName = statusId != null ? statusMap.get(statusId) : undefined;
          const descricao = p?.dsDarecer || '';
          return {
            type: 'PARECER' as const,
            id: p.idSolicitacaoParecer,
            descricao,
            statusId,
            statusName,
            responsavelNome,
            responsavelPerfil,
            areaNome,
            dataISO,
            nivel: p?.nrNivel,
            areaOrigem: null,
            areaDestino: null,
          };
        });

        const combined = [...tramItems, ...parecerItems].sort((a, b) => {
          const da = a.dataISO ? new Date(a.dataISO).getTime() : 0;
          const db = b.dataISO ? new Date(b.dataISO).getTime() : 0;
          return db - da;
        });

        setTimeline(combined);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        toast.error('Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };

    loadDados();
  }, [idSolicitacao, open]);

  const handleClose = () => {
    setTimeline([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Tramitações</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando tramitações...</span>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma tramitação encontrada para esta solicitação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    {item.type === 'PARECER' && (
                      <Badge variant="outline" className="text-gray-700">DIRETORIA (Parecer)</Badge>
                    )}
                    {item.type === 'TRAMITACAO' && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-gray-700">{item.areaOrigem}</Badge>
                        <ArrowRightIcon className="h-4 w-4 text-gray-600" />
                        <Badge variant="outline" className="text-gray-700">{item.areaDestino}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      {item.descricao ? (
                        <p className="text-sm text-gray-800 font-medium leading-relaxed break-words">
                          {item.descricao}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">Sem observação</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-0.5 text-right">
                      <div className="text-sm font-medium text-gray-800 max-w-[260px] truncate">
                        {item.responsavelNome || 'Responsável não informado'}
                      </div>
                      <div className="text-xs text-gray-600">
                        { formatDateTime(item.dataISO ?? '')}
                      </div>
                      {item.statusName && (
                        <div className="text-xs text-gray-600">
                          {`Status: ${item.statusName}`}
                        </div>
                      )}
                    </div>
                  </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
