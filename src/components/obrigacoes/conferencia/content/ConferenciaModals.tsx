'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AnexoObrigacaoModal } from '../modal/AnexoObrigacaoModal';
import { JustificarAtrasoModal } from '../modal/JustificarAtrasoModal';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';

interface ConferenciaModalsProps {
  modals: {
    showAnexarEvidenciaModal: boolean;
    showAnexarCorrespondenciaModal: boolean;
    showSolicitarAjustesDialog: boolean;
    showEnviarRegulatorioDialog: boolean;
    showAprovarConferenciaDialog: boolean;
    showConfirmarAprovarTramitacaoDialog: boolean;
    showConfirmarReprovarTramitacaoDialog: boolean;
    showJustificarAtrasoModal: boolean;
  };
  onCloseModal: (modalName: string) => void;
  obrigacaoId?: number;
  idPerfil?: number | null;
  dsJustificativaAtraso?: string | null;
  onConfirmSolicitarAjustes: () => void;
  onConfirmEnviarParaAnalise: () => void;
  onConfirmAprovarConferencia: () => void;
  onConfirmAprovarTramitacao: () => void;
  onConfirmReprovarTramitacao: () => void;
  onConfirmJustificarAtraso: (justificativa: string) => Promise<void>;
  onAnexarEvidenciaSuccess: () => void;
  onAnexarCorrespondenciaSuccess: () => void;
}

export function ConferenciaModals({
  modals,
  onCloseModal,
  obrigacaoId,
  idPerfil,
  dsJustificativaAtraso,
  onConfirmSolicitarAjustes,
  onConfirmEnviarParaAnalise,
  onConfirmAprovarConferencia,
  onConfirmAprovarTramitacao,
  onConfirmReprovarTramitacao,
  onConfirmJustificarAtraso,
  onAnexarEvidenciaSuccess,
  onAnexarCorrespondenciaSuccess,
}: ConferenciaModalsProps) {
  if (!obrigacaoId) return null;

  return (
    <>
      <AnexoObrigacaoModal
        open={modals.showAnexarEvidenciaModal}
        onClose={() => onCloseModal('showAnexarEvidenciaModal')}
        title="Anexar arquivo de evidência de cumprimento"
        tpDocumento={TipoDocumentoAnexoEnum.E}
        idObrigacao={obrigacaoId}
        idPerfil={idPerfil ?? undefined}
        onSuccess={onAnexarEvidenciaSuccess}
      />

      <AnexoObrigacaoModal
        open={modals.showAnexarCorrespondenciaModal}
        onClose={() => onCloseModal('showAnexarCorrespondenciaModal')}
        title="Anexar correspondência"
        tpDocumento={TipoDocumentoAnexoEnum.R}
        idObrigacao={obrigacaoId}
        idPerfil={idPerfil ?? undefined}
        onSuccess={onAnexarCorrespondenciaSuccess}
      />

      <ConfirmationDialog
        open={modals.showSolicitarAjustesDialog}
        onOpenChange={(open) => !open && onCloseModal('showSolicitarAjustesDialog')}
        title="Solicitar ajustes"
        description="Tem certeza que deseja solicitar ajustes para esta obrigação?"
        confirmText="Sim, solicitar ajustes"
        cancelText="Cancelar"
        onConfirm={onConfirmSolicitarAjustes}
        variant="default"
      />

      <ConfirmationDialog
        open={modals.showEnviarRegulatorioDialog}
        onOpenChange={(open) => !open && onCloseModal('showEnviarRegulatorioDialog')}
        title="Enviar para análise do regulatório"
        description="Tem certeza que deseja enviar esta obrigação para análise do regulatório?"
        confirmText="Sim, enviar"
        cancelText="Cancelar"
        onConfirm={onConfirmEnviarParaAnalise}
        variant="default"
      />

      <ConfirmationDialog
        open={modals.showAprovarConferenciaDialog}
        onOpenChange={(open) => !open && onCloseModal('showAprovarConferenciaDialog')}
        title="Aprovar conferência"
        description="Tem certeza que deseja aprovar a conferência dessa obrigação?"
        confirmText="Sim, aprovar"
        cancelText="Não"
        onConfirm={onConfirmAprovarConferencia}
        variant="default"
      />

      <ConfirmationDialog
        open={modals.showConfirmarAprovarTramitacaoDialog}
        onOpenChange={(open) => !open && onCloseModal('showConfirmarAprovarTramitacaoDialog')}
        title="Aprovar obrigação"
        description="Tem certeza que deseja aprovar esta obrigação?"
        confirmText="Sim, aprovar"
        cancelText="Cancelar"
        onConfirm={onConfirmAprovarTramitacao}
        variant="default"
      />

      <ConfirmationDialog
        open={modals.showConfirmarReprovarTramitacaoDialog}
        onOpenChange={(open) => !open && onCloseModal('showConfirmarReprovarTramitacaoDialog')}
        title="Reprovar obrigação"
        description="Tem certeza que deseja reprovar esta obrigação?"
        confirmText="Sim, reprovar"
        cancelText="Cancelar"
        onConfirm={onConfirmReprovarTramitacao}
        variant="destructive"
      />

      <JustificarAtrasoModal
        open={modals.showJustificarAtrasoModal}
        onClose={() => onCloseModal('showJustificarAtrasoModal')}
        onConfirm={onConfirmJustificarAtraso}
        justificativaExistente={dsJustificativaAtraso || undefined}
      />
    </>
  );
}

