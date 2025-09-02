'use client';

import { useState, useEffect } from 'react';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { tramitacoesClient } from '@/api/tramitacoes/client';
import { AreaResponse } from '@/api/areas/types';
import { SpinnerIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Área de Origem</TableHead>
                  <TableHead>Área de Destino</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tramitacoes.map((tramitacao) => (
                  <TableRow key={tramitacao.idTramitacao}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {tramitacao.areaOrigem.nmArea}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tramitacao.areaOrigem.cdArea}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {tramitacao.areaDestino.nmArea}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tramitacao.areaDestino.cdArea}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tramitacao.tramitacaoAcao && tramitacao.tramitacaoAcao.length > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {tramitacao.tramitacaoAcao[0].responsavelArea.responsavel.nmResponsavel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tramitacao.tramitacaoAcao && tramitacao.tramitacaoAcao.length > 0 ? (
                        <span className="text-sm">
                          {formatDate(tramitacao.tramitacaoAcao[0].dtCriacao)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tramitacao.dsObservacao ? (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 break-words">
                            {tramitacao.dsObservacao}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
