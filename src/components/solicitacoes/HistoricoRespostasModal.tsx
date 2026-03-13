'use client';

import correspondenciaClient from '@/api/correspondencia/client';
import { CorrespondenciaResumoComHistoricoResponse, HistoricoRespostaItemResponse, TipoHistoricoResposta } from '@/api/correspondencia/types';
import { FilePdfIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import ExportHistoricoPdf from './relatorios/ExportHistoricoPdf';
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
  const [historico, setHistorico] = useState<HistoricoRespostaItemResponse[]>([]);
  const [correspondenciaResumo, setCorrespondenciaResumo] = useState<CorrespondenciaResumoComHistoricoResponse['correspondencia'] | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistoricoRespostas = async () => {
      if (!idSolicitacao || !open) return;
      
      try {
        setLoading(true);
        const response = await correspondenciaClient.listarHistoricoRespostas(idSolicitacao);
        setHistorico(response.historicoResposta);
        setCorrespondenciaResumo(response.correspondencia);
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
    return (historico || []).map((item) => {

      return {
        id: item.id,
        tipo: item.tipo as TipoHistoricoResposta,
        dsDescricao: item.dsDescricao,
        responsavelNome: item.responsavel?.nmResponsavel || 'Responsável não informado',
        dtCriacao: item.dtCriacao || null,
        nmStatus: item.nmStatus || null,
        areaOrigem: item.areaOrigem?.nmArea || null,
        areaDestino: item.areaDestino?.nmArea || null,
        nrTempoGasto: item.nrTempoGasto || null,
        idPerfil: item.responsavel?.perfil?.idPerfil || null,
        flAprovado: item.flAprovado || null,
      };
    });
  }, [historico]);

  if (!open) return null;

  return (
    <>
      <HistoricoTramitacaoBaseModal
        open={open}
        onClose={handleClose}
        title={title}
        headerActions={
          <Button
            size="sm"
            variant="outline"
            className="mr-5 flex items-center gap-2"
            onClick={() => setExporting(true)}
            disabled={exporting}>
            <FilePdfIcon className="h-4 w-4" />
            Exportar PDF
          </Button>
        }
        loading={loading}
        loadingText={loadingText}
        emptyText={emptyText}
        items={items}
      />
      {exporting && correspondenciaResumo && (
        <ExportHistoricoPdf
          correspondencia={correspondenciaResumo}
          historico={historico}
          onDone={() => setExporting(false)}
        />
      )}
    </>
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