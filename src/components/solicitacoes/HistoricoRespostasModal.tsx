'use client';

import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {TramitacaoComAnexosResponse} from '@/api/solicitacoes/types';
import {Button} from '../ui/button';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { STATUS_LIST } from '@/api/status-solicitacao/types';
import HistoricoTramitacaoBaseModal, { HistoricoBaseItem } from './HistoricoTramitacaoBaseModal';

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
  const [tramitacao, setTramitacao] = useState<TramitacaoComAnexosResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pareceres, setPareceres] = useState<SolicitacaoParecerResponse[]>([]);

  useEffect(() => {
    const loadTramitacoes = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await solicitacoesClient.buscarDetalhesPorId(idSolicitacao);
        setTramitacao(response.tramitacoes);
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

  const handleClose = () => {
    setTramitacao([]);
    setPareceres([]);
    onClose();
  };
  
  const items: HistoricoBaseItem[] = useMemo(() => {
    const getStatusLabelById = (id?: number | null) => {
      if (!id) return null;
      return STATUS_LIST.find(s => s.id === id)?.label || null;
    };

    const toMs = (s?: string | null) => {
      const t = new Date(s || '').getTime();
      return Number.isNaN(t) ? 0 : t;
    };

    const tramItems: HistoricoBaseItem[] = (tramitacao || []).map((r) => {
      const acao = r?.tramitacao?.tramitacaoAcao && r.tramitacao.tramitacaoAcao.length > 0 ? r.tramitacao.tramitacaoAcao[0] : undefined;
      return {
        id: r.tramitacao.idTramitacao,
        type: 'TRAMITACAO',
        descricao: r.tramitacao.dsObservacao || '',
        responsavelNome: acao?.responsavelArea?.responsavel?.nmResponsavel || 'Responsável não informado',
        dataISO: acao?.dtCriacao || null,
        statusLabel: getStatusLabelById(r?.tramitacao?.idStatusSolicitacao ?? null),
        areaOrigem: r?.tramitacao?.areaOrigem?.nmArea || null,
        areaDestino: r?.tramitacao?.areaDestino?.nmArea || null,
      };
    });

    const parecerItems: HistoricoBaseItem[] = (pareceres || []).map((p) => ({
      id: p.idSolicitacaoParecer,
      type: 'PARECER',
      descricao: p?.dsDarecer || '',
      responsavelNome: p?.responsavel?.nmResponsavel || 'Responsável não informado',
      dataISO: p?.dtCriacao || null,
      statusLabel: getStatusLabelById(p?.idStatusSolicitacao ?? null),
      areaOrigem: null,
      areaDestino: null,
    }));

    return [...tramItems, ...parecerItems].sort((a, b) => toMs(b.dataISO) - toMs(a.dataISO));
  }, [tramitacao, pareceres]);

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