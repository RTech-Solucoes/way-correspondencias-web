'use client';

import { useState, useEffect } from 'react';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { tramitacoesClient } from '@/api/tramitacoes/client';
import { AreaResponse } from '@/api/areas/types';
import { SpinnerIcon, ArrowRight } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { SolicitacaoResponse } from '@/api/solicitacoes/types';

interface HistoricoRespostasModalProps {
  idSolicitacao: number | null;
  open: boolean;
  onClose: () => void;
  areas: AreaResponse[];
}

export default function HistoricoRespostasModal({ 
  idSolicitacao, 
  open, 
  onClose, 
  areas 
}: HistoricoRespostasModalProps) {
  const [respostas, setRespostas] = useState<TramitacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTramitacoes = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        // const response = await solicitacoesClient.listarRespostasPorSolicitacao(idSolicitacao);
        const response = await tramitacoesClient.listarPorSolicitacao(idSolicitacao);
        setRespostas(response);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Respostas</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
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
            <div className="space-y-4">
              {respostas.map((resposta) => (
                <div 
                  key={resposta.idTramitacao}
                  className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                >
                  {/* Primeira linha: Descrição */}
                  <div className="mb-3">
                    {resposta.dsObservacao ? (
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">
                        {resposta.dsObservacao}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Sem observação
                      </p>
                    )}
                  </div>

                  {/* Segunda linha: Layout principal */}
                  <div className="flex items-center justify-between">
                    {/* Lado esquerdo: Responsável e Data/Hora */}
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-800">
                        {resposta.tramitacaoAcao && resposta.tramitacaoAcao.length > 0 ? (
                          resposta.tramitacaoAcao[0].responsavelArea.responsavel.nmResponsavel
                        ) : (
                          'Responsável não informado'
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {resposta.tramitacaoAcao && resposta.tramitacaoAcao.length > 0 ? (
                          formatDate(resposta.tramitacaoAcao[0].dtCriacao)
                        ) : (
                          'Data não informada'
                        )}
                      </div>
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
