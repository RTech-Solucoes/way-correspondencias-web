'use client';

import { ObrigacaoModal } from "@/components/obrigacoes/criar/ObrigacaoModal";
import { FilterModalObrigacao } from "@/components/obrigacoes/modal/FilterModalObrigacao";
import { DeleteObrigacaoDialog } from "@/components/obrigacoes/modal/DeleteObrigacaoDialog";
import { ImportObrigacoesModal } from "@/components/obrigacoes/modal/ImportObrigacoesModal";
import { AnexarProtocoloModal } from "@/components/obrigacoes/modal/AnexarProtocoloModal";
import { ObrigacoesCondicionadasModal } from "@/components/obrigacoes/modal/ObrigacoesCondicionadasModal";
import { NaoAplicavelSuspensoModal } from "@/components/obrigacoes/conferencia/modal/NaoAplicavelSuspensoModal";
import { TramitacaoObrigacaoModal } from "@/components/obrigacoes/tramitacao";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ObrigacaoResponse, ObrigacaoResumoResponse } from "@/api/obrigacao/types";
import { FlAprovadoTramitacaoEnum } from "@/api/tramitacoes/types";
import tramitacoesClient from "@/api/tramitacoes/client";
import { toast } from "sonner";

interface ObrigacoesModalsProps {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  obrigacaoParaProtocolo: ObrigacaoResponse | null;
  showAnexarProtocoloModal: boolean;
  setShowAnexarProtocoloModal: (show: boolean) => void;
  setObrigacaoParaProtocolo: (obrigacao: ObrigacaoResponse | null) => void;
  idPerfil?: number | null;
  loadObrigacoes: () => Promise<void>;
  showObrigacoesCondicionadasModal: boolean;
  setShowObrigacoesCondicionadasModal: (show: boolean) => void;
  obrigacoesCondicionadas: ObrigacaoResumoResponse[];
  setObrigacoesCondicionadas: (obrigacoes: ObrigacaoResumoResponse[]) => void;
  obrigacaoParaNaoAplicavelSuspenso: ObrigacaoResponse | null;
  showNaoAplicavelSuspensoModal: boolean;
  setShowNaoAplicavelSuspensoModal: (show: boolean) => void;
  setObrigacaoParaNaoAplicavelSuspenso: (obrigacao: ObrigacaoResponse | null) => void;
  handleConfirmNaoAplicavelSuspenso: (justificativa: string) => Promise<void>;
  showTramitacaoModal: boolean;
  setShowTramitacaoModal: (show: boolean) => void;
  obrigacaoParaTramitacao: ObrigacaoResponse | null;
  setObrigacaoParaTramitacao: (obrigacao: ObrigacaoResponse | null) => void;
  showConfirmTramitacao: boolean;
  setShowConfirmTramitacao: (show: boolean) => void;
  obrigacaoParaConfirmarTramitacao: ObrigacaoResponse | null;
  setObrigacaoParaConfirmarTramitacao: (obrigacao: ObrigacaoResponse | null) => void;
}

export function ObrigacoesModals({
  showImportModal,
  setShowImportModal,
  obrigacaoParaProtocolo,
  showAnexarProtocoloModal,
  setShowAnexarProtocoloModal,
  setObrigacaoParaProtocolo,
  idPerfil,
  loadObrigacoes,
  showObrigacoesCondicionadasModal,
  setShowObrigacoesCondicionadasModal,
  obrigacoesCondicionadas,
  setObrigacoesCondicionadas,
  obrigacaoParaNaoAplicavelSuspenso,
  showNaoAplicavelSuspensoModal,
  setShowNaoAplicavelSuspensoModal,
  setObrigacaoParaNaoAplicavelSuspenso,
  handleConfirmNaoAplicavelSuspenso,
  showTramitacaoModal,
  setShowTramitacaoModal,
  obrigacaoParaTramitacao,
  setObrigacaoParaTramitacao,
  showConfirmTramitacao,
  setShowConfirmTramitacao,
  obrigacaoParaConfirmarTramitacao,
  setObrigacaoParaConfirmarTramitacao,
}: ObrigacoesModalsProps) {
  return (
    <>
      <ObrigacaoModal />
      <FilterModalObrigacao />
      <DeleteObrigacaoDialog />
      <ImportObrigacoesModal 
        open={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
      {obrigacaoParaProtocolo && (
        <AnexarProtocoloModal
          open={showAnexarProtocoloModal}
          onClose={() => {
            setShowAnexarProtocoloModal(false);
            setObrigacaoParaProtocolo(null);
          }}
          idObrigacao={obrigacaoParaProtocolo.idSolicitacao}
          idPerfil={idPerfil ?? undefined}
          onSuccess={async () => {
            await loadObrigacoes();
          }}
        />
      )}
      
      <ObrigacoesCondicionadasModal
        open={showObrigacoesCondicionadasModal}
        onClose={() => {
          setShowObrigacoesCondicionadasModal(false);
          setObrigacoesCondicionadas([]);
        }}
        obrigacoesCondicionadas={obrigacoesCondicionadas}
      />

      {obrigacaoParaNaoAplicavelSuspenso && (
        <NaoAplicavelSuspensoModal
          open={showNaoAplicavelSuspensoModal}
          onClose={() => {
            setShowNaoAplicavelSuspensoModal(false);
            setObrigacaoParaNaoAplicavelSuspenso(null);
          }}
          onConfirm={handleConfirmNaoAplicavelSuspenso}
          justificativaExistente={obrigacaoParaNaoAplicavelSuspenso.dsRespNaoAplicavelSusp || null}
        />
      )}

      <TramitacaoObrigacaoModal
        open={showTramitacaoModal}
        onClose={() => {
          setShowTramitacaoModal(false);
          setObrigacaoParaTramitacao(null);
        }}
        onConfirm={() => {
          loadObrigacoes();
        }}
        obrigacaoId={obrigacaoParaTramitacao?.idSolicitacao || null}
      />

      <ConfirmationDialog
        open={showConfirmTramitacao}
        onOpenChange={setShowConfirmTramitacao}
        title="Confirmar tramitação"
        description="Deseja realmente enviar esta obrigação para tramitação?"
        confirmText="Sim, enviar"
        cancelText="Cancelar"
        onConfirm={async () => {
          if (!obrigacaoParaConfirmarTramitacao?.idSolicitacao) {
            toast.error('ID da obrigação não encontrado.');
            return;
          }

          try {
            await tramitacoesClient.tramitarViaFluxo({
              idSolicitacao: obrigacaoParaConfirmarTramitacao.idSolicitacao,
              dsObservacao: 'Obrigação enviada para tramitação.',
              flAprovado: FlAprovadoTramitacaoEnum.R,
            });
            
            toast.success('Obrigação enviada para tramitação com sucesso!');
            
            setObrigacaoParaTramitacao(obrigacaoParaConfirmarTramitacao);
            setShowConfirmTramitacao(false);
            setShowTramitacaoModal(true);
            setObrigacaoParaConfirmarTramitacao(null);
            
            await loadObrigacoes();
          } catch (error) {
            console.error('Erro ao enviar obrigação para tramitação:', error);
            toast.error('Erro ao enviar obrigação para tramitação. Tente novamente.');
          }
        }}
      />
    </>
  );
}