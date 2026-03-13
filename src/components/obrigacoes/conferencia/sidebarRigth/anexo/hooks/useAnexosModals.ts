import { useState, useCallback } from 'react';

export function useAnexosModals() {
  const [showAnexarEvidenciaModal, setShowAnexarEvidenciaModal] = useState(false);
  const [showAnexarOutrosModal, setShowAnexarOutrosModal] = useState(false);
  const [showAnexarTramitacaoModal, setShowAnexarTramitacaoModal] = useState(false);

  // Memoizar setters para estabilidade de referência
  const openAnexarEvidenciaModal = useCallback(() => {
    setShowAnexarEvidenciaModal(true);
  }, []);

  const closeAnexarEvidenciaModal = useCallback(() => {
    setShowAnexarEvidenciaModal(false);
  }, []);

  const openAnexarOutrosModal = useCallback(() => {
    setShowAnexarOutrosModal(true);
  }, []);

  const closeAnexarOutrosModal = useCallback(() => {
    setShowAnexarOutrosModal(false);
  }, []);

  const openAnexarTramitacaoModal = useCallback(() => {
    setShowAnexarTramitacaoModal(true);
  }, []);

  const closeAnexarTramitacaoModal = useCallback(() => {
    setShowAnexarTramitacaoModal(false);
  }, []);

  return {
    showAnexarEvidenciaModal,
    showAnexarOutrosModal,
    showAnexarTramitacaoModal,
    setShowAnexarEvidenciaModal,
    setShowAnexarOutrosModal,
    setShowAnexarTramitacaoModal,
    openAnexarEvidenciaModal,
    closeAnexarEvidenciaModal,
    openAnexarOutrosModal,
    closeAnexarOutrosModal,
    openAnexarTramitacaoModal,
    closeAnexarTramitacaoModal,
  };
}

