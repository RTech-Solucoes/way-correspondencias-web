'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { ObrigacaoContratualRequest } from '@/api/obrigacao-contratual/types';
import { ClassificacaoEnum } from '@/api/obrigacao-contratual/enums';

import { Step1Obrigacao } from './steps/Step1Obrigacao';
import { Step2Obrigacao } from './steps/Step2Obrigacao';
import { Step3Obrigacao } from './steps/Step3Obrigacao';
import { Step4Obrigacao } from './steps/Step4Obrigacao';
import { Step5Obrigacao } from './steps/Step5Obrigacao';
import { Step6Obrigacao } from './steps/Step6Obrigacao';
import obrigacaoContratualClient from '@/api/obrigacao-contratual/client';

export type ObrigacaoFormData = Partial<ObrigacaoContratualRequest>;

const steps = [
  { title: 'Dados', description: 'Informações da obrigação' },
  { title: 'Temas e Áreas', description: 'Categorização' },
  { title: 'Prazos', description: 'Datas e periodicidade' },
  { title: 'Uploads', description: 'Anexos e documentos' },
  { title: 'Vínculos', description: 'ANTT, PAS, TAC' },
  { title: 'Resumo', description: 'Revisão final' },
];

export function ObrigacaoModal() {
  const { showObrigacaoModal, setShowObrigacaoModal, selectedObrigacao, setSelectedObrigacao } = useObrigacoes();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ObrigacaoFormData>({
    cdIdentificador: '',
    dsTarefa: '',
    tpClassificacao: null,
    tpPeriodicidade: null,
    tpCriticidade: null,
    tpNatureza: null,
    dsObservacao: '',
    idTema: null,
    idAreaAtribuida: null,
    idAreaCondicionante: null,
    idsAreasCondicionantes: [],
    dtInicio: null,
    dtTermino: null,
    dtLimite: null,
    nrDuracaoDias: null,
    dsAntt: '',
    dsProtocoloExterno: '',
    dsTac: '',
    idStatusObrigacao: 1,
    nrNivel: 1,
    flAtivo: 'S',
  });

  useEffect(() => {
    if (showObrigacaoModal) {
      if (selectedObrigacao) {
        const obrigacaoData = selectedObrigacao as ObrigacaoFormData;
        setFormData({
          cdIdentificador: selectedObrigacao.cdIdentificador || '',
          dsTarefa: selectedObrigacao.dsTarefa || '',
          tpClassificacao: selectedObrigacao.tpClassificacao || null,
          tpPeriodicidade: selectedObrigacao.tpPeriodicidade || null,
          tpCriticidade: selectedObrigacao.tpCriticidade || null,
          tpNatureza: selectedObrigacao.tpNatureza || null,
          dsObservacao: selectedObrigacao.dsComentario || '',
          idTema: selectedObrigacao.idTema || null,
          idAreaAtribuida: selectedObrigacao.idAreaAtribuida || null,
          idAreaCondicionante: selectedObrigacao.idAreaCondicionante || null,
          idsAreasCondicionantes: obrigacaoData.idsAreasCondicionantes || [],
          dtInicio: selectedObrigacao.dtInicio || null,
          dtTermino: selectedObrigacao.dtTermino || null,
          dtLimite: selectedObrigacao.dtLimite || null,
          nrDuracaoDias: selectedObrigacao.nrDuracaoDias || null,
          dsAntt: selectedObrigacao.dsAntt || '',
          dsProtocoloExterno: selectedObrigacao.dsProtocoloExterno || '',
          dsTac: selectedObrigacao.dsTac || '',
          idStatusObrigacao: selectedObrigacao.idStatusObrigacao || 1,
          nrNivel: selectedObrigacao.nrNivel || 1,
          flAtivo: selectedObrigacao.flAtivo || 'S',
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          idStatusObrigacao: 1,
        }));
      }
    }
  }, [showObrigacaoModal, selectedObrigacao]);

  const handleClose = () => {
    setShowObrigacaoModal(false);
    setSelectedObrigacao(null);
    setCurrentStep(1);
    setFormData({
      cdIdentificador: '',
      dsTarefa: '',
      tpClassificacao: null,
      tpPeriodicidade: null,
      tpCriticidade: null,
      tpNatureza: null,
      dsObservacao: '',
      idTema: null,
      idAreaAtribuida: null,
      idAreaCondicionante: null,
      idsAreasCondicionantes: [],
      dtInicio: null,
      dtTermino: null,
      dtLimite: null,
      nrDuracaoDias: null,
      dsAntt: '',
      dsProtocoloExterno: '',
      dsTac: '',
      idStatusObrigacao: 1,
      nrNivel: 1,
      flAtivo: 'S',
    });
  };

  const updateFormData = (data: Partial<ObrigacaoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        const isClassificacaoCondicionada = formData.tpClassificacao === ClassificacaoEnum.CONDICIONADA;
        
        if (!formData.dsTarefa?.trim()) return false;
        if (!formData.tpClassificacao) return false;
        if (!formData.tpPeriodicidade) return false;
        if (!formData.tpCriticidade) return false;
        if (!formData.tpNatureza) return false;
        
        if (isClassificacaoCondicionada && !formData.idObrigacaoContratualPai) return false;
              
        return true;

      case 2:
        if (!formData.idTema) return false;
        if (!formData.idAreaAtribuida) return false;
        return true;

      case 3:
        if (!formData.dtInicio) return false;
        if (!formData.dtTermino) return false;
        
        if (formData.dtInicio && formData.dtTermino) {
          const dataInicio = new Date(formData.dtInicio);
          const dataTermino = new Date(formData.dtTermino);
          if (dataTermino < dataInicio) return false;
        }
        if (!formData.dtLimite) return false;
        
        return true;

      default:
        return true;
    }
  }, [formData]);

  const isvalidProximaStep = useMemo(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (!isvalidProximaStep) {
        return;
      }
    
      switch (currentStep) {
        case 1:
            await obrigacaoContratualClient.salvarStep1(formData);
            break;
        case 2:
            await obrigacaoContratualClient.salvarStep2(formData);
            break;
        case 3:
            await obrigacaoContratualClient.salvarStep3(formData);
            break;
        case 4:
            await obrigacaoContratualClient.salvarStep4(formData);
            break;
        case 5:
            await obrigacaoContratualClient.salvarStep5(formData);
            break;
        case 6:
            await obrigacaoContratualClient.salvarStep6(formData);
            handleClose();
            break;
      }
      
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const isEditing = !!selectedObrigacao;
    switch (currentStep) {
      case 1:
        return <Step1Obrigacao formData={formData} updateFormData={updateFormData} isEditing={isEditing} />;
      case 2:
        return <Step2Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Obrigacao formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={showObrigacaoModal} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] h-[89vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedObrigacao ? 'Editar Obrigação' : 'Nova obrigação'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Stepper currentStep={currentStep} steps={steps} />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
                  
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
          Etapa Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={loading || !isvalidProximaStep}>
                {loading ? 'Salvando...' : 'Próxima etapa'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={loading || !isvalidProximaStep}>
                {loading 
                  ? (selectedObrigacao ? 'Atualizando...' : 'Criando...') 
                  : (selectedObrigacao ? 'Atualizar Obrigação' : 'Criar Obrigação')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

