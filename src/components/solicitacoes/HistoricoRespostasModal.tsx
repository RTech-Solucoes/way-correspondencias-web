'use client';

import {useEffect, useState} from 'react';
import {ArrowRightIcon, SpinnerIcon} from '@phosphor-icons/react';
import {toast} from 'sonner';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {TramitacaoComAnexosResponse} from '@/api/solicitacoes/types';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';

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

  useEffect(() => {
    const loadTramitacoes = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await solicitacoesClient.buscarDetalhesPorId(idSolicitacao);
        setRespostas(response.tramitacoes);
      } catch (error) {
        console.error('Erro ao carregar respostas:', error);
        toast.error('Erro ao carregar respostas');
      } finally {
        setLoading(false);
      }
    };

    loadTramitacoes();
  }, [idSolicitacao, open]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const handleClose = () => {
    setRespostas([]);
    onClose();
  };
  
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Respostas</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col max-h-[70vh] flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando respostas...</span>
            </div>
          ) : respostas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma resposta encontrada para esta solicitação.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {respostas.map((resposta) => {
                const observacao = resposta.tramitacao.dsObservacao;
                
                const tramitacaoAcao = resposta.tramitacao.tramitacaoAcao;

                const responsavel = !!tramitacaoAcao?.length ? (
                  tramitacaoAcao[0]?.responsavelArea?.responsavel?.nmResponsavel
                ) : (
                  'Responsável não informado'
                );

                const dataResposta = !!tramitacaoAcao?.length ? (
                  formatDate(tramitacaoAcao[0].dtCriacao)
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