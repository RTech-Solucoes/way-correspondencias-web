'use client';

import {useEffect, useState} from 'react';
import {ArrowRightIcon, SpinnerIcon} from '@phosphor-icons/react';
import {toast} from 'sonner';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {TramitacaoComAnexosResponse} from '@/api/solicitacoes/types';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { formatDateTime } from '@/utils/utils';

interface HistoricoRespostasModalProps {
  idSolicitacao: number | null;
  open: boolean;
  onClose: () => void;
}

export default function HistoricoRespostasModal({ 
  idSolicitacao, 
  open, 
  onClose, 
}: HistoricoRespostasModalProps) {
  const [respostas, setRespostas] = useState<TramitacaoComAnexosResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pareceres, setPareceres] = useState<SolicitacaoParecerResponse[]>([]);
  type CombinedItem = {
    tipo: 'tramitacao' | 'parecer';
    nivel: number;
    statusId: number;
    dtMs: number;
    data: TramitacaoComAnexosResponse | SolicitacaoParecerResponse;
  };
  const [itensOrdenados, setItensOrdenados] = useState<CombinedItem[]>([]);

  useEffect(() => {
    const loadTramitacoes = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await solicitacoesClient.buscarDetalhesPorId(idSolicitacao);
        setRespostas(response.tramitacoes);
        setPareceres((response?.solicitacaoPareceres) || []);
      } catch (error) {
        console.error('Erro ao carregar respostas:', error);
        toast.error('Erro ao carregar respostas');
      } finally {
        setLoading(false);
      }
    };

    loadTramitacoes();
  }, [idSolicitacao, open]);

  useEffect(() => {
    const toNum = (v?: number | null) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
    const toMs = (s?: string) => {
      const t = new Date(s || '').getTime();
      return Number.isNaN(t) ? 0 : t;
    };

    const combined: CombinedItem[] = [
      ...respostas.map(r => ({
        tipo: 'tramitacao' as const,
        nivel: toNum(r?.tramitacao?.nrNivel),
        statusId: toNum(r?.tramitacao?.idStatusSolicitacao),
        dtMs: toMs(r?.tramitacao?.tramitacaoAcao?.[0]?.dtCriacao),
        data: r,
      })),
      ...pareceres.map(p => ({
        tipo: 'parecer' as const,
        nivel: toNum(p?.nrNivel),
        statusId: toNum(p?.idStatusSolicitacao),
        dtMs: toMs(p?.dtCriacao),
        data: p,
      })),
    ];

    combined.sort((a, b) => b.dtMs - a.dtMs);

    setItensOrdenados(combined);
  }, [respostas, pareceres]);


  const handleClose = () => {
    setRespostas([]);
    setPareceres([]);
    onClose();
  };
  
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Respostas</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando respostas...</span>
            </div>
          ) : (itensOrdenados.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma resposta encontrada para esta solicitação.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {itensOrdenados.map((item) => {
                if (item.tipo === 'tramitacao') {
                  const resposta = item.data as TramitacaoComAnexosResponse;
                const observacao = resposta.tramitacao.dsObservacao;
                
                const tramitacaoAcao = resposta.tramitacao.tramitacaoAcao;

                const responsavel = !!tramitacaoAcao?.length ? (
                  tramitacaoAcao[0]?.responsavelArea?.responsavel?.nmResponsavel
                ) : (
                  'Responsável não informado'
                );

                const dataResposta = !!tramitacaoAcao?.length ? (
                  formatDateTime(tramitacaoAcao[0].dtCriacao)
                ) : (
                  'Data não informada'
                )

                if (!observacao) return null;

                return (
                  <div 
                    key={resposta.tramitacao.idTramitacao}
                    className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                        >
                          {resposta.tramitacao.areaOrigem.nmArea}
                        </Badge>

                        <ArrowRightIcon className="h-4 w-4 text-gray-600" />

                        <Badge 
                          variant="secondary" 
                          className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                        >
                          {resposta.tramitacao.areaDestino.nmArea}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          {dataResposta}
                        </div>
                      </div>
                    </div>

                  <div className="mb-3">
                    {observacao ? (
                      <p className="text-sm text-gray-800 font-medium leading-relaxed truncate whitespace-normal">
                        {observacao}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Sem observação
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-right font-medium text-gray-800">
                    {responsavel}
                  </div>
                </div>
              );
                }
                const p = item.data as SolicitacaoParecerResponse;
                const dataResposta = formatDateTime(p?.dtCriacao);
                const observacao = p?.dsDarecer;
                return (
                  <div 
                    key={`parecer-${p?.idSolicitacaoParecer ?? Math.random()}`}
                    className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                        >
                          DIRETORIA
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          {dataResposta || 'Data não informada'}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      {observacao ? (
                        <p className="text-sm text-gray-800 font-medium leading-relaxed truncate whitespace-normal">
                          {observacao}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          Sem observação
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-right font-medium text-gray-800">
                      {p?.responsavel?.nmResponsavel || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface HistoricoRespostasModalButtonProps {
  idSolicitacao: number | null;
  showButton?: boolean;
  quantidadeDevolutivas?: number;
}

export function HistoricoRespostasModalButton({ idSolicitacao, showButton = true, quantidadeDevolutivas = 0 }: HistoricoRespostasModalButtonProps) {
  const [open, setOpen] = useState(false);

  const handleToggleModal = () => {
    setOpen(state => !state);
  };
  
  if (!showButton) return null;

  return (
    <>
      <div>
        <span className="text-xs text-color-p text-[#EA5600]">{quantidadeDevolutivas} devolutivas</span>

        <Button type="button" variant="link" onClick={handleToggleModal}>
          Histórico de Respostas
        </Button>
      </div>

      <HistoricoRespostasModal
        idSolicitacao={idSolicitacao}
        open={open}
        onClose={handleToggleModal}
      />
    </>
  );
}