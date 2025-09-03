'use client';

import {useEffect, useState} from 'react';
import {TramitacaoResponse} from '@/api/tramitacoes/types';
import {tramitacoesClient} from '@/api/tramitacoes/client';
import {AreaResponse} from '@/api/areas/types';
import {ArrowRight, SpinnerIcon} from '@phosphor-icons/react';
import {toast} from 'sonner';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
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
  areas 
}: TramitacaoModalProps) {
  const [tramitacoes, setTramitacoes] = useState<TramitacaoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTramitacoes = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await tramitacoesClient.listarPorSolicitacao(idSolicitacao);
        setTramitacoes(response.reverse());
      } catch (error) {
        console.error('Erro ao carregar tramitações:', error);
        toast.error('Erro ao carregar tramitações');
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
    setTramitacoes([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Tramitações</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando tramitações...</span>
            </div>
          ) : tramitacoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma tramitação encontrada para esta solicitação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tramitacoes.map((tramitacao) => (
                <div 
                  key={tramitacao.idTramitacao}
                  className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                >
                  <div className="mb-3">
                    {tramitacao.dsObservacao ? (
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">
                        {tramitacao.dsObservacao}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Sem observação
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm font-medium text-gray-800">
                        {tramitacao.tramitacaoAcao && tramitacao.tramitacaoAcao.length > 0 ? (
                          tramitacao.tramitacaoAcao[0].responsavelArea.responsavel.nmResponsavel
                        ) : (
                          'Responsável não informado'
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {tramitacao.tramitacaoAcao && tramitacao.tramitacaoAcao.length > 0 ? (
                          formatDate(tramitacao.tramitacaoAcao[0].dtCriacao)
                        ) : (
                          'Data não informada'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                      >
                        {tramitacao.areaOrigem.nmArea}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-600" />
                      <Badge 
                        variant="secondary" 
                        className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                      >
                        {tramitacao.areaDestino.nmArea}
                      </Badge>
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
