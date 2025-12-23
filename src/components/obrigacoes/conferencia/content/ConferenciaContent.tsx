'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArquivoDTO } from '@/api/anexos/type';
import { useUserGestao } from '@/hooks/use-user-gestao';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { ConferenciaSidebar } from '../sidebarRigth/ConferenciaSidebar';
import { ConferenciaFooter } from '../ConferenciaFooter';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { FlAprovadoTramitacaoEnum } from '@/api/tramitacoes/types';

// Hooks
import {
  useConferenciaDetalhes,
  useConferenciaAnexos,
  useConferenciaModals,
  useConferenciaAcoes,
  useConferenciaDerivados,
  useConferenciaPermissoes,
} from '../hooks';

// Components
import { ConferenciaHeader } from './ConferenciaHeader';
import { ConferenciaTabs } from './ConferenciaTabs';
import { ConferenciaModals } from './ConferenciaModals';

type TabKey = 'dados' | 'temas' | 'prazos' | 'anexos' | 'vinculos';

interface ConferenciaContentProps {
  id: string;
}

export function ConferenciaContent({ id }: ConferenciaContentProps) {
  const router = useRouter();
  const { isAdminOrGestor, idPerfil } = useUserGestao();
  const { 
    canAprovarConferenciaObrigacao, 
    canSolicitarAjustesObrigacao, 
  } = usePermissoes();

  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [isCienciaChecked, setIsCienciaChecked] = useState(false);
  const [arquivosTramitacaoPendentes, setArquivosTramitacaoPendentes] = useState<ArquivoDTO[]>([]);
  
  const comentarioActionsRef = useRef<{ 
    get: () => string; 
    reset: () => void;
    getTramitacaoRef: () => number | null;
    getParecerRef: () => number | null;
  } | null>(null);

  // Hooks de dados
  const { detalhe, pageLoading, userResponsavel, reloadDetalhe } = useConferenciaDetalhes({ id });

  const obrigacao = detalhe?.obrigacao;
  const anexos = useMemo(() => detalhe?.anexos ?? [], [detalhe]);

  // Hooks de funcionalidades
  const { downloading, handleDownloadAnexo } = useConferenciaAnexos({ 
    obrigacaoId: obrigacao?.idSolicitacao 
  });

  const { modals, openModal, closeModal } = useConferenciaModals();

  const { 
    isStatusAtrasada,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    isStatusDesabilitadoParaTramitacao,
    isStatusBtnFlAprovar,
  } = useConferenciaDerivados({ obrigacao, anexos });

  const { 
    isUsuarioDaAreaAtribuida,
    isPerfilPermitidoEnviarReg,
  } = useConferenciaPermissoes({ detalhe, idPerfil, userResponsavel });

  const {
    loading,
    confirmarSolicitarAjustes,
    handleAprovarReprovarTramitacao,
    confirmarAprovarConferencia,
    confirmarJustificarAtraso,
    confirmarEnviarParaAnalise,
    handleEnviarParaTramitacao,
  } = useConferenciaAcoes({
    obrigacaoId: obrigacao?.idSolicitacao,
    statusId: obrigacao?.statusSolicitacao?.idStatusSolicitacao,
    detalhe,
    dsJustificativaAtraso: obrigacao?.dsJustificativaAtraso,
    isStatusAtrasada,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    arquivosTramitacaoPendentes,
    comentarioActionsRef,
    reloadDetalhe,
    onClearArquivosTramitacao: () => setArquivosTramitacaoPendentes([]),
  });

  // Handlers de modal
  const handleSolicitarAjustesClick = useCallback(() => {
    openModal('showSolicitarAjustesDialog');
  }, [openModal]);

  const handleEnviarParaAnaliseClick = useCallback(() => {
    openModal('showEnviarRegulatorioDialog');
  }, [openModal]);

  const handleAprovarConferenciaClick = useCallback(() => {
    if (isStatusBtnFlAprovar) {
      openModal('showConfirmarAprovarTramitacaoDialog');
    } else {
      openModal('showAprovarConferenciaDialog');
    }
  }, [isStatusBtnFlAprovar, openModal]);

  const handleReprovarConferenciaClick = useCallback(() => {
    openModal('showConfirmarReprovarTramitacaoDialog');
  }, [openModal]);

  const handleAnexarEvidenciaSuccess = useCallback(async () => {
    await reloadDetalhe();
    toast.success('Evidência de cumprimento anexada com sucesso!');
  }, [reloadDetalhe]);

  const handleAnexarCorrespondenciaSuccess = useCallback(async () => {
    await reloadDetalhe();
    toast.success('Correspondência anexada com sucesso!');
  }, [reloadDetalhe]);

  if (pageLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!obrigacao) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-gray-600">Não foi possível encontrar a obrigação.</p>
        <Button onClick={() => router.push('/obrigacao')}>Voltar para a lista</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 gap-6 px-8 py-6 pb-32 pr-[calc(28rem+2rem)]">
        <div className="flex flex-1 flex-col gap-6">
          <ConferenciaHeader
            cdIdentificacao={obrigacao.cdIdentificacao}
            prazos={detalhe?.solicitacaoPrazos}
            idStatusAtual={obrigacao.statusSolicitacao?.idStatusSolicitacao}
          />

          <ConferenciaTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            obrigacao={obrigacao}
            anexos={anexos}
            downloadingId={downloading}
            onDownloadAnexo={handleDownloadAnexo}
          />
        </div>
      </main>

      {detalhe && (
        <ConferenciaSidebar 
          detalhe={detalhe} 
          onRefreshAnexos={reloadDetalhe}
          podeEnviarComentarioPorPerfilEArea={isPerfilPermitidoEnviarReg}
          isStatusDesabilitadoParaTramitacao={isStatusDesabilitadoParaTramitacao}
          onRegisterComentarioActions={(actions) => {
            comentarioActionsRef.current = actions;
          }}
          arquivosTramitacaoPendentes={arquivosTramitacaoPendentes}
          onAddArquivosTramitacao={(files) => setArquivosTramitacaoPendentes(prev => [...prev, ...files])}
          onRemoveArquivoTramitacao={(index) => setArquivosTramitacaoPendentes(prev => prev.filter((_, i) => i !== index))}
          onClearArquivosTramitacao={() => setArquivosTramitacaoPendentes([])}
        />
      )}
    
      <ConferenciaFooter
        statusSolicitacao={obrigacao?.statusSolicitacao}
        isAdminOrGestor={isAdminOrGestor}
        flAprovarConferencia={obrigacao?.flAprovarConferencia}
        isUsuarioDaAreaAtribuida={isUsuarioDaAreaAtribuida}
        idPerfil={idPerfil}
        userResponsavel={userResponsavel}
        tramitacoes={detalhe?.tramitacoes}
        solicitacoesAssinantes={detalhe?.solicitacoesAssinantes || obrigacao?.solicitacoesAssinantes}
        anexos={anexos}
        dsJustificativaAtraso={obrigacao?.dsJustificativaAtraso}
        canAprovarConferencia={canAprovarConferenciaObrigacao}
        canSolicitarAjustes={canSolicitarAjustesObrigacao}
        flExigeCienciaGerenteRegul={obrigacao?.flExigeCienciaGerenteRegul}
        isCienciaChecked={isCienciaChecked}
        onCienciaCheckedChange={setIsCienciaChecked}
        onAnexarCorrespondencia={() => openModal('showAnexarCorrespondenciaModal')}
        onSolicitarAjustes={handleSolicitarAjustesClick}
        onAprovarConferencia={handleAprovarConferenciaClick}
        onReprovarConferencia={handleReprovarConferenciaClick}
        onAprovarReprovarTramitacao={handleAprovarReprovarTramitacao}
        onJustificarAtraso={() => openModal('showJustificarAtrasoModal')}
        onAnexarEvidencia={() => openModal('showAnexarEvidenciaModal')}
        onEnviarParaAnalise={handleEnviarParaAnaliseClick}
        onEnviarParaTramitacao={handleEnviarParaTramitacao}
        isStatusDesabilitadoParaTramitacao={isStatusDesabilitadoParaTramitacao}
        arquivosTramitacaoPendentes={arquivosTramitacaoPendentes}
      />

      <ConferenciaModals
        modals={modals}
        onCloseModal={(modalName) => closeModal(modalName as keyof typeof modals)}
        obrigacaoId={obrigacao.idSolicitacao}
        idPerfil={idPerfil}
        dsJustificativaAtraso={obrigacao.dsJustificativaAtraso || undefined}
        onConfirmSolicitarAjustes={confirmarSolicitarAjustes}
        onConfirmEnviarParaAnalise={confirmarEnviarParaAnalise}
        onConfirmAprovarConferencia={confirmarAprovarConferencia}
        onConfirmAprovarTramitacao={() => handleAprovarReprovarTramitacao(FlAprovadoTramitacaoEnum.S)}
        onConfirmReprovarTramitacao={() => handleAprovarReprovarTramitacao(FlAprovadoTramitacaoEnum.N)}
        onConfirmJustificarAtraso={confirmarJustificarAtraso}
        onAnexarEvidenciaSuccess={handleAnexarEvidenciaSuccess}
        onAnexarCorrespondenciaSuccess={handleAnexarCorrespondenciaSuccess}
      />

      {loading && (
        <LoadingOverlay 
          title="Processando..." 
          subtitle="Aguarde enquanto o processo é concluído." 
        />
      )}
    </div>
  );
}
