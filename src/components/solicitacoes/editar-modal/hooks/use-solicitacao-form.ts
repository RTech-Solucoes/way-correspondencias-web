'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { statusList as statusListType } from '@/api/status-solicitacao/types';
import { capitalize } from '@/utils/utils';
import { AnaliseGerenteDiretor } from '@/api/solicitacoes/types';
import { INITIAL_FORM_DATA, SolicitacaoFormData } from '../types';

interface UseSolicitacaoFormProps {
  correspondencia: CorrespondenciaResponse | null;
  open: boolean;
  initialSubject?: string;
  initialDescription?: string;
  temas: TemaResponse[];
  responsaveis: ResponsavelResponse[];
}

export function useSolicitacaoForm({
  correspondencia,
  open,
  initialSubject,
  initialDescription,
  temas,
  responsaveis,
}: UseSolicitacaoFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SolicitacaoFormData>(INITIAL_FORM_DATA);
  const [prazoExcepcional, setPrazoExcepcional] = useState(false);

  const canEditSolicitacao = useMemo(() => {
    if (!correspondencia) return true;

    const isPreAnalise =
      correspondencia.statusSolicitacao?.idStatusSolicitacao === statusListType.PRE_ANALISE.id ||
      correspondencia.statusSolicitacao?.nmStatus === statusListType.PRE_ANALISE.label;

    return isPreAnalise;
  }, [correspondencia]);

  // Reset form quando modal abre/fecha ou correspondencia muda
  useEffect(() => {
    if (correspondencia) {
      setFormData({
        idEmail: correspondencia.idEmail,
        cdIdentificacao: correspondencia.cdIdentificacao || '',
        dsAssunto: correspondencia.dsAssunto || '',
        dsSolicitacao: correspondencia.dsSolicitacao || '',
        dsObservacao: correspondencia.dsObservacao || '',
        flStatus: correspondencia.flStatus || 'P',
        idResponsavel: correspondencia.idResponsavel || 0,
        idTema: correspondencia.tema?.idTema || correspondencia.idTema || 0,
        idsAreas: [
          ...(correspondencia.area?.map(a => a.idArea) || []),
          ...(correspondencia.tema?.areas?.map(a => a.idArea) || []),
        ],
        nrPrazo: correspondencia.nrPrazo || undefined,
        tpPrazo: correspondencia.tpPrazo === 'C' ? 'H' : correspondencia.tpPrazo || '',
        nrOficio: correspondencia.nrOficio || '',
        nrProcesso: correspondencia.nrProcesso || '',
        flAnaliseGerenteDiretor: correspondencia.flAnaliseGerenteDiretor || '',
        flExcepcional: correspondencia.flExcepcional || 'N',
        flExigeCienciaGerenteRegul: correspondencia.flExigeCienciaGerenteRegul || '',
      });

      const isExcepcional = (correspondencia.flExcepcional || 'N') === 'S';
      setPrazoExcepcional(isExcepcional);
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        dsAssunto: initialSubject || '',
        dsSolicitacao: initialDescription || '',
      });
      setPrazoExcepcional(false);
    }
    setCurrentStep(1);
  }, [correspondencia, open, initialSubject, initialDescription]);

  // Sync prazoExcepcional com formData
  useEffect(() => {
    const flExcepcionalValue = prazoExcepcional ? 'S' : 'N';
    setFormData(prev => ({
      ...prev,
      flExcepcional: flExcepcionalValue,
    }));
  }, [prazoExcepcional]);

  const updateFormData = useCallback((data: Partial<SolicitacaoFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      let processedValue: string | number | undefined = value;

      if (name === 'dsAssunto') {
        processedValue = capitalize(value);
      } else if (name === 'nrPrazo') {
        processedValue = value === '' ? undefined : parseInt(value);
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    },
    []
  );

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds,
    }));
  }, []);

  const handleResponsaveisSelectionChange = useCallback((selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      idsResponsaveisAssinates: selectedIds,
    }));
  }, []);

  const getSelectedTema = useCallback(() => {
    return temas.find(tema => tema.idTema === formData.idTema);
  }, [temas, formData.idTema]);

  const getResponsavelFromTema = useCallback(
    (temaId: number): number => {
      const tema = temas.find(t => t.idTema === temaId);
      if (tema && responsaveis.length > 0) {
        return responsaveis[0].idResponsavel;
      }
      return responsaveis.length > 0 ? responsaveis[0].idResponsavel : 0;
    },
    [temas, responsaveis]
  );

  const getResponsavelByArea = useCallback(
    (areaId: number) => {
      return responsaveis.find(resp => resp.areas?.some(respArea => respArea.area.idArea === areaId));
    },
    [responsaveis]
  );

  // Validações de steps
  const isStep1Valid = useCallback(() => {
    return (
      formData.cdIdentificacao?.trim() !== '' &&
      ([AnaliseGerenteDiretor.D, AnaliseGerenteDiretor.G, AnaliseGerenteDiretor.N, AnaliseGerenteDiretor.A] as string[]).includes(
        (formData.flAnaliseGerenteDiretor || '').toUpperCase()
      ) &&
      (formData.flExigeCienciaGerenteRegul === 'S' || formData.flExigeCienciaGerenteRegul === 'N')
    );
  }, [formData.cdIdentificacao, formData.flAnaliseGerenteDiretor, formData.flExigeCienciaGerenteRegul]);

  const isStep2Valid = useCallback(() => {
    return (formData.idTema !== undefined && formData.idTema > 0 && formData.idsAreas && formData.idsAreas.length > 0) || false;
  }, [formData.idTema, formData.idsAreas]);

  const isStep4Valid = useCallback(() => {
    return !!(formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length === 2);
  }, [formData.idsResponsaveisAssinates]);

  const canNavigateToStep = useCallback(
    (step: number): boolean => {
      if (step === 1) return true;
      if (step === 2) return isStep1Valid();
      if (step === 3) return isStep1Valid() && isStep2Valid();
      if (step === 4) return isStep1Valid() && isStep2Valid();
      if (step >= 5) return isStep1Valid() && isStep2Valid() && isStep4Valid();
      return false;
    },
    [isStep1Valid, isStep2Valid, isStep4Valid]
  );

  const handleStepClick = useCallback(
    (step: number) => {
      if (canNavigateToStep(step)) {
        setCurrentStep(step);
      }
    },
    [canNavigateToStep]
  );

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    updateFormData,
    prazoExcepcional,
    setPrazoExcepcional,
    canEditSolicitacao,
    handleInputChange,
    handleAreasSelectionChange,
    handleResponsaveisSelectionChange,
    getSelectedTema,
    getResponsavelFromTema,
    getResponsavelByArea,
    isStep1Valid,
    isStep2Valid,
    isStep4Valid,
    canNavigateToStep,
    handleStepClick,
    handlePreviousStep,
  };
}
