'use client';

import { useCallback, useMemo } from 'react';
import type { AnexoResponse, ArquivoDTO } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';
import { AnexoObrigacaoModal } from '../../modal/AnexoObrigacaoModal';
import {
  useAnexosFiltrados,
  useAnexosPermissoes,
  useEvidenceLinkInput,
  useAnexosModals,
} from './hooks';

import {
  ProtocoloSection,
  EvidenciaSection,
  CorrespondenciaSection,
  OutrosAnexosSection,
  TramitacaoSection,
  AnexosTramitacaoPendentes,
} from './sections';

interface AnexosTabProps {
  anexos: AnexoResponse[];
  tramitacoes?: TramitacaoComAnexosResponse[];
  downloadingId: number | null;
  onDeleteAnexo: (anexo: AnexoResponse) => void | Promise<void>;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onEvidenceLinkRemove: (link: string) => void;
  onEvidenceLinkAdd?: (link: string) => void;
  idObrigacao: number;
  idPerfil?: number;
  onRefreshAnexos?: () => void;
  isStatusEmAndamento?: boolean;
  isStatusAtrasada?: boolean;
  isStatusEmValidacaoRegulatorio?: boolean;
  isStatusPendente?: boolean;
  isStatusNaoIniciado?: boolean;
  isStatusConcluido?: boolean;
  isStatusNaoAplicavelSuspensa?: boolean;
  isStatusPreAnalise?: boolean;
  isStatusAprovacaoTramitacao?: boolean;
  isDaAreaAtribuida?: boolean;
  isStatusDesabilitadoParaTramitacao?: boolean;
  arquivosTramitacaoPendentes?: ArquivoDTO[];
  onAddArquivosTramitacao?: (files: ArquivoDTO[]) => void;
  onRemoveArquivoTramitacao?: (index: number) => void;
}

export function AnexosTab({
  anexos,
  tramitacoes = [],
  downloadingId,
  onDeleteAnexo,
  onDownloadAnexo,
  onEvidenceLinkRemove,
  onEvidenceLinkAdd,
  idObrigacao,
  idPerfil,
  onRefreshAnexos,
  isStatusEmAndamento = false,
  isStatusAtrasada = false,
  isStatusEmValidacaoRegulatorio = false,
  isStatusPendente = false,
  isStatusNaoIniciado = false,
  isStatusConcluido = false,
  isStatusNaoAplicavelSuspensa = false,
  isStatusPreAnalise = false,
  isStatusAprovacaoTramitacao = false,
  isDaAreaAtribuida = false,
  isStatusDesabilitadoParaTramitacao = false,
  arquivosTramitacaoPendentes = [],
  onAddArquivosTramitacao,
  onRemoveArquivoTramitacao,
}: AnexosTabProps) {
  const anexosFiltrados = useAnexosFiltrados({ anexos, tramitacoes });

  const permissoes = useAnexosPermissoes({
    isStatusEmAndamento,
    isStatusAtrasada,
    isStatusEmValidacaoRegulatorio,
    isStatusPendente,
    isStatusNaoIniciado,
    isStatusConcluido,
    isStatusNaoAplicavelSuspensa,
    isDaAreaAtribuida,
    idPerfil,
  });

  const evidenceLinkInput = useEvidenceLinkInput({
    onEvidenceLinkAdd,
  });

  const modals = useAnexosModals();

  // Usar handlers memoizados do hook
  const handleOpenAnexarEvidenciaModal = modals.openAnexarEvidenciaModal;
  const handleCloseAnexarEvidenciaModal = modals.closeAnexarEvidenciaModal;
  const handleOpenAnexarOutrosModal = modals.openAnexarOutrosModal;
  const handleCloseAnexarOutrosModal = modals.closeAnexarOutrosModal;
  const handleOpenAnexarTramitacaoModal = modals.openAnexarTramitacaoModal;
  const handleCloseAnexarTramitacaoModal = modals.closeAnexarTramitacaoModal;

  // Memoizar handler de refresh para evitar re-renders
  const handleRefreshAnexos = useCallback(() => {
    if (onRefreshAnexos) {
      onRefreshAnexos();
    }
  }, [onRefreshAnexos]);

  // Memoizar handler de remover arquivo
  const handleRemoveArquivo = useCallback((index: number) => {
    if (onRemoveArquivoTramitacao) {
      onRemoveArquivoTramitacao(index);
    }
  }, [onRemoveArquivoTramitacao]);

  // Memoizar props do EvidenceLinkInput
  const evidenceLinkInputProps = useMemo(() => ({
    showLinkInput: evidenceLinkInput.showLinkInput,
    evidenceLinkValue: evidenceLinkInput.evidenceLinkValue,
    linkError: evidenceLinkInput.linkError,
    onEvidenceLinkValueChange: evidenceLinkInput.handleEvidenceLinkValueChange,
    onEvidenceLinkSave: evidenceLinkInput.handleEvidenceLinkSave,
    onEvidenceLinkCancel: evidenceLinkInput.handleEvidenceLinkCancel,
    onToggleLinkInput: evidenceLinkInput.handleToggleLinkInput,
  }), [
    evidenceLinkInput.showLinkInput,
    evidenceLinkInput.evidenceLinkValue,
    evidenceLinkInput.linkError,
    evidenceLinkInput.handleEvidenceLinkValueChange,
    evidenceLinkInput.handleEvidenceLinkSave,
    evidenceLinkInput.handleEvidenceLinkCancel,
    evidenceLinkInput.handleToggleLinkInput,
  ]);

  return (
    <div className="space-y-6 mb-5">
      <ProtocoloSection
        anexos={anexosFiltrados.protocoloAnexos}
        downloadingId={downloadingId}
        onDownloadAnexo={onDownloadAnexo}
        onDeleteAnexo={onDeleteAnexo}
        podeExcluirAnexo={permissoes.podeExcluirAnexo}
      />

      <EvidenciaSection
        evidenceAnexos={anexosFiltrados.evidenceAnexos}
        evidenceLinksAnexos={anexosFiltrados.evidenceLinksAnexos}
        downloadingId={downloadingId}
        onDownloadAnexo={onDownloadAnexo}
        onDeleteAnexo={onDeleteAnexo}
        onEvidenceLinkRemove={onEvidenceLinkRemove}
        podeExcluirAnexo={permissoes.podeExcluirAnexo}
        podeAnexarEvidencia={permissoes.podeAnexarEvidencia}
        statusPermiteAnexarEvidencia={permissoes.statusPermiteAnexarEvidencia}
        tooltipEvidencia={permissoes.tooltipEvidencia}
        onOpenAnexarEvidenciaModal={handleOpenAnexarEvidenciaModal}
        {...evidenceLinkInputProps}
      />

      <CorrespondenciaSection
        anexos={anexosFiltrados.correspondenciaAnexos}
        downloadingId={downloadingId}
        onDownloadAnexo={onDownloadAnexo}
        onDeleteAnexo={onDeleteAnexo}
        podeExcluirAnexo={permissoes.podeExcluirAnexo}
      />

      <OutrosAnexosSection
        anexos={anexosFiltrados.outrosAnexos}
        downloadingId={downloadingId}
        onDownloadAnexo={onDownloadAnexo}
        onDeleteAnexo={onDeleteAnexo}
        podeExcluirAnexo={permissoes.podeExcluirAnexo}
        statusPermiteAnexarOutros={permissoes.statusPermiteAnexarOutros}
        tooltipOutrosAnexos={permissoes.tooltipOutrosAnexos}
        onOpenAnexarOutrosModal={handleOpenAnexarOutrosModal}
      />

      {!isStatusDesabilitadoParaTramitacao && !isStatusEmValidacaoRegulatorio && (
        <TramitacaoSection
          anexos={anexosFiltrados.tramitacaoAnexos}
          downloadingId={downloadingId}
          onDownloadAnexo={onDownloadAnexo}
          onDeleteAnexo={onDeleteAnexo}
          podeExcluirAnexo={permissoes.podeExcluirAnexo}
          isStatusConcluido={isStatusConcluido}
          isStatusPreAnalise={isStatusPreAnalise}
          isStatusAprovacaoTramitacao={isStatusAprovacaoTramitacao}
          onOpenAnexarTramitacaoModal={handleOpenAnexarTramitacaoModal}
        />
      )}

      <AnexosTramitacaoPendentes
        arquivos={arquivosTramitacaoPendentes}
        onRemoveArquivo={handleRemoveArquivo}
      />

      <AnexoObrigacaoModal
        open={modals.showAnexarEvidenciaModal}
        onClose={handleCloseAnexarEvidenciaModal}
        title="Anexar arquivo de evidência de cumprimento"
        tpDocumento={TipoDocumentoAnexoEnum.E}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        onSuccess={handleRefreshAnexos}
      />

      <AnexoObrigacaoModal
        open={modals.showAnexarOutrosModal}
        onClose={handleCloseAnexarOutrosModal}
        title="Anexar outros anexos"
        tpDocumento={TipoDocumentoAnexoEnum.A}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        onSuccess={handleRefreshAnexos}
      />

      <AnexoObrigacaoModal
        open={modals.showAnexarTramitacaoModal}
        onClose={handleCloseAnexarTramitacaoModal}
        title="Selecionar documentos de tramitação"
        tpDocumento={TipoDocumentoAnexoEnum.C}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        isTramitacao={true}
        onFilesSelected={onAddArquivosTramitacao}
        onSuccess={handleRefreshAnexos}
      />
    </div>
  );
}