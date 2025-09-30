'use client';

import {useEffect, useMemo, useState} from 'react';
import {HistoricoRespostaItemDTO, TipoHistoricoResposta} from '@/api/solicitacoes/types';
import {Button} from '../ui/button';
import HistoricoTramitacaoBaseModal, { HistoricoBaseItem } from './HistoricoTramitacaoBaseModal';
import tramitacoesClient from '@/api/tramitacoes/client';

interface HistoricoRespostasModalProps {
  idSolicitacao: number | null;
  open: boolean;
  onClose: () => void;
  title?: string;
  loadingText?: string;
  emptyText?: string;
}

export default function HistoricoRespostasModal({ 
  idSolicitacao, 
  open, 
  onClose,
  title = 'Histórico de Respostas',
  loadingText = 'Carregando respostas...',
  emptyText = 'Nenhuma resposta encontrada para esta solicitação.',
}: HistoricoRespostasModalProps) {
  const [historico, setHistorico] = useState<HistoricoRespostaItemDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistoricoRespostas = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await tramitacoesClient.listarHistoricoRespostas(idSolicitacao);
        setHistorico(response);
      } catch (error) {
        console.error('Erro ao carregar histórico de respostas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricoRespostas();
  }, [idSolicitacao, open]);

  const handleClose = () => {
    setHistorico([]);
    onClose();
  };
  
  const items: HistoricoBaseItem[] = useMemo(() => {
    return (historico || []).map((item) => ({
      id: item.id,
      type: item.tipo as TipoHistoricoResposta,
      descricao: item.descricao,
      responsavelNome: item.responsavel?.nmResponsavel || 'Responsável não informado',
      dataISO: item.data || null,
      statusLabel: item.statusLabel || null,
      areaOrigem: item.areaOrigem?.nmArea || null,
      areaDestino: item.areaDestino?.nmArea || null,
    }));
  }, [historico]);

  if (!open) return null;

  return (
    <HistoricoTramitacaoBaseModal
      open={open}
      onClose={handleClose}
      title={title}
      loading={loading}
      loadingText={loadingText}
      emptyText={emptyText}
      items={items}
    />
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