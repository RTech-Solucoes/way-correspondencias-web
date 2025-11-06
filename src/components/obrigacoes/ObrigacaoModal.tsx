'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { ObrigacaoRequest } from '@/api/obrigacao/types';
import { CaretRightIcon, CaretLeftIcon } from '@phosphor-icons/react';

import { Step1Obrigacao } from './steps/Step1Obrigacao';
import { Step2Obrigacao } from './steps/Step2Obrigacao';
import { Step3Obrigacao } from './steps/Step3Obrigacao';
import { Step4Obrigacao } from './steps/Step4Obrigacao';
import { Step5Obrigacao } from './steps/Step5Obrigacao';
import { Step6Obrigacao } from './steps/Step6Obrigacao';
import obrigacaoClient from '@/api/obrigacao/client';
import { TipoEnum, CategoriaEnum } from '@/api/tipos/types';
import tiposClient from '@/api/tipos/client';
import { ArquivoDTO, TipoResponsavelAnexo } from '@/api/anexos/type';
import { CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface ObrigacaoFormData extends Partial<ObrigacaoRequest> {
  cdIdentificador?: string;
  idStatusObrigacao?: number;
  idObrigacaoContratualPai?: number | null;
  idsAreasCondicionantes?: number[];
  idSolicitacao?: number | null;
  idObrigacaoContratualVinculo?: number | null;
  nrNivel?: number;
  flAtivo?: string;
}

const steps = [
  { title: 'Dados', description: 'Informações da obrigação' },
  { title: 'Temas e Áreas', description: 'Categorização' },
  { title: 'Prazos', description: 'Datas e periodicidade' },
  { title: 'Uploads', description: 'Anexos e documentos' },
  { title: 'Vínculos', description: 'Vincular dados' },
  { title: 'Resumo', description: 'Revisão final' },
];

export function ObrigacaoModal() {
  const { showObrigacaoModal, setShowObrigacaoModal, loadObrigacoes } = useObrigacoes();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [idTipoClassificacaoCondicionada, setIdTipoClassificacaoCondicionada] = useState<number | null>(null);
  const [anexosParaEnviar, setAnexosParaEnviar] = useState<File[]>([]);
  const [formData, setFormData] = useState<ObrigacaoFormData>({
    cdIdentificador: '',
    dsTarefa: '',
    idTipoClassificacao: null,
    idTipoPeriodicidade: null,
    idTipoCriticidade: null,
    idTipoNatureza: null,
    dsObservacao: '',
    idObrigacaoPrincipal: null,
    idTema: null,
    idAreaAtribuida: null,
    idsAreasCondicionantes: [],
    dtInicio: null,
    dtTermino: null,
    dtLimite: null,
    nrDuracaoDias: null,
    idSolicitacaoCorrespondencia: null,
    dsAntt: '',
    dsProtocoloExterno: '',
    idObrigacaoRecusada: null,
    dsTac: '',
    idStatusSolicitacao: 12,
  });

  useEffect(() => {
    if (showObrigacaoModal) {
      setFormData((prev) => ({
        ...prev,
        idStatusSolicitacao: 12,
      }));
    }
  }, [showObrigacaoModal]);

  useEffect(() => {
    const carregarTipoCondicionada = async () => {
      try {
        const tipos = await tiposClient.buscarPorCategorias([CategoriaEnum.CLASSIFICACAO]);
        const condicionada = tipos.find(t => t.cdTipo === TipoEnum.CONDICIONADA);
        if (condicionada) {
          setIdTipoClassificacaoCondicionada(condicionada.idTipo);
        }
      } catch (error) {
        console.error('Erro ao carregar tipo de classificação condicionada:', error);
      }
    };
    
    if (showObrigacaoModal) {
      carregarTipoCondicionada();
    }
  }, [showObrigacaoModal]);

  const handleClose = () => {
    setShowObrigacaoModal(false);
    setCurrentStep(1);
    setAnexosParaEnviar([]);
    setFormData({
      idSolicitacao: null,
      dsTarefa: '',
      idStatusSolicitacao: 12,
      idTipoClassificacao: null,
      idTipoPeriodicidade: null,
      idTipoCriticidade: null,
      idTipoNatureza: null,
      dsObservacao: null,
      idObrigacaoPrincipal: null,
      idsAreasCondicionantes: [],
      idAreaAtribuida: null,
      idTema: null,
      dtInicio: null,
      dtTermino: null,
      dtLimite: null,
      nrDuracaoDias: null,
      idSolicitacaoCorrespondencia: null,
      dsAntt: null,
      dsProtocoloExterno: null,
      idObrigacaoRecusada: null,
      dsTac: null,
    });
    loadObrigacoes();
  };

  const updateFormData = (data: Partial<ObrigacaoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.dsTarefa?.trim()) return false;
        if (!formData.idTipoClassificacao) return false;
        if (!formData.idTipoCriticidade) return false;
        if (!formData.idTipoNatureza) return false;
        
        const isClassificacaoCondicionada = formData.idTipoClassificacao === idTipoClassificacaoCondicionada;
        if (isClassificacaoCondicionada && !formData.idObrigacaoPrincipal && !formData.idObrigacaoContratualPai) return false;
    
        return true;

      case 2:
        if (!formData.idTema) return false;
        if (!formData.idAreaAtribuida) return false;
        return true;

      case 3:
        if (!formData.dtInicio) return false;
        if (!formData.dtTermino) return false;
        if (!formData.idTipoPeriodicidade) return false;

        if (!formData.dtLimite) return false;
        
        return true;

      default:
        return true;
    }
  }, [formData, idTipoClassificacaoCondicionada]);

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
        case 5:
            let arquivosDTO: ArquivoDTO[] = [];
            
            if (anexosParaEnviar.length > 0) {
              arquivosDTO = await Promise.all(
                anexosParaEnviar.map(async (file) => {
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result as string;
                      const commaIndex = result.indexOf(',');
                      resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });

                  return {
                    nomeArquivo: file.name,
                    tipoConteudo: file.type,
                    tpResponsavel: TipoResponsavelAnexo.A,
                    conteudoArquivo: base64,
                  };
                })
              );
            }

            const formDataComAnexos = {
              ...formData,
              arquivos: arquivosDTO.length > 0 ? arquivosDTO : undefined,
            };

            const response = await obrigacaoClient.criar(formDataComAnexos);
            if (response.idSolicitacao) {
                updateFormData({ idSolicitacao: response.idSolicitacao });
            }
            loadObrigacoes();
            break;
        case 6:
            if (formData.idSolicitacao) {
              try {
                const response = await obrigacaoClient.replicarObrigacoesPorPeriodicidade(formData.idSolicitacao);
                toast.success(response.mensagem);
                loadObrigacoes();
              } catch (error) {
                console.error('Erro ao replicar obrigação:', error);
                toast.error('Erro ao replicar obrigação por periodicidade.');
              }
            }
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
    switch (currentStep) {
      case 1:
        return <Step1Obrigacao formData={formData} updateFormData={updateFormData} isEditing={false} />;
      case 2:
        return <Step2Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Obrigacao formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Obrigacao formData={formData} updateFormData={updateFormData} anexos={anexosParaEnviar} onAnexosChange={setAnexosParaEnviar} />;
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
            Nova obrigação
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
            className="flex items-center gap-2"
          >
            <CaretLeftIcon className="h-4 w-4" />
            Etapa Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={loading || !isvalidProximaStep} className="flex items-center gap-2">
                {!loading && <CaretRightIcon className="h-4 w-4" />}
                {loading ? 'Salvando...' : 'Próxima etapa'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={loading || !isvalidProximaStep} className="flex items-center gap-2">
                {!loading && <CheckCircleIcon className="h-4 w-4" />}
                {loading ? 'Concluindo...' : 'Concluir'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

