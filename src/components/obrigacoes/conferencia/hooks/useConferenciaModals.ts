import { useState, useCallback } from 'react';

interface ModalStates {
  showAnexarEvidenciaModal: boolean;
  showAnexarCorrespondenciaModal: boolean;
  showSolicitarAjustesDialog: boolean;
  showEnviarRegulatorioDialog: boolean;
  showAprovarConferenciaDialog: boolean;
  showConfirmarAprovarTramitacaoDialog: boolean;
  showConfirmarReprovarTramitacaoDialog: boolean;
  showJustificarAtrasoModal: boolean;
}

export function useConferenciaModals() {
  const [modals, setModals] = useState<ModalStates>({
    showAnexarEvidenciaModal: false,
    showAnexarCorrespondenciaModal: false,
    showSolicitarAjustesDialog: false,
    showEnviarRegulatorioDialog: false,
    showAprovarConferenciaDialog: false,
    showConfirmarAprovarTramitacaoDialog: false,
    showConfirmarReprovarTramitacaoDialog: false,
    showJustificarAtrasoModal: false,
  });

  const openModal = useCallback((modalName: keyof ModalStates) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: keyof ModalStates) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      showAnexarEvidenciaModal: false,
      showAnexarCorrespondenciaModal: false,
      showSolicitarAjustesDialog: false,
      showEnviarRegulatorioDialog: false,
      showAprovarConferenciaDialog: false,
      showConfirmarAprovarTramitacaoDialog: false,
      showConfirmarReprovarTramitacaoDialog: false,
      showJustificarAtrasoModal: false,
    });
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
  };
}

