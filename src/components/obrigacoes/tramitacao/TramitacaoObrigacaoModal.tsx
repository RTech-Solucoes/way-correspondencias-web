'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Step1Dados } from './steps/Step1Dados';
import { Step3Prazos } from './steps/Step3Prazos';
import { Step6Resumo } from './steps/Step6Resumo';
import { Step2Obrigacao, Step4Obrigacao } from '../criar';
import { ObrigacaoFormData } from '../criar/ObrigacaoModal';
import { MultiSelectAssinantes } from '@/components/ui/multi-select-assinates';

export interface TramitacaoFormData {
  dsTarefa?: string;
  cdIdentificacao?: string;
  cdItem?: string;
  flAnaliseGerenteDiretor?: string;
  flExigeCienciaGerenteRegul?: string;
  dsAssunto?: string;
  dsObservacao?: string;
  idTema?: number | null;
  idsAreas?: number[];
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  idsAssinantes?: number[];
  anexos?: File[];
}

interface TramitacaoObrigacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (data: TramitacaoFormData) => void;
}

const steps = [
  { title: 'Dados', description: 'Informações básicas' },
  { title: 'Temas e áreas', description: 'Categorização' },
  { title: 'Prazos', description: 'Datas e prazos' },
  { title: 'Assinantes', description: 'Responsáveis' },
  { title: 'Anexos', description: 'Documentos' },
  { title: 'Resumo', description: 'Revisão final' },
];

export function TramitacaoObrigacaoModal({ open, onClose, onConfirm }: TramitacaoObrigacaoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TramitacaoFormData>({
    dsTarefa: '',
    cdIdentificacao: '',
    cdItem: '',
    flAnaliseGerenteDiretor: '',
    flExigeCienciaGerenteRegul: '',
    dsAssunto: '',
    dsObservacao: '',
    idTema: null,
    idsAreas: [],
    dtInicio: null,
    dtTermino: null,
    dtLimite: null,
    idsAssinantes: [],
    anexos: [],
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
    }
  }, [open]);

  const updateFormData = (data: Partial<TramitacaoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(formData);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      dsTarefa: '',
      cdIdentificacao: '',
      cdItem: '',
      flAnaliseGerenteDiretor: '',
      flExigeCienciaGerenteRegul: '',
      dsAssunto: '',
      dsObservacao: '',
      idTema: null,
      idsAreas: [],
      dtInicio: null,
      dtTermino: null,
      dtLimite: null,
      idsAssinantes: [],
      anexos: [],
    });
    onClose();
  };

  const canNavigateToStep = (step: number) => {
    return step <= currentStep + 1;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Dados
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <Step2Obrigacao
            formData={{
              idTema: formData.idTema ?? null,
              idAreaAtribuida: formData.idsAreas?.[0] ?? null,
              idsAreasCondicionantes: formData.idsAreas?.slice(1) ?? [],
            } as ObrigacaoFormData}
            updateFormData={(data) => updateFormData({ ...formData, ...data } as Partial<TramitacaoFormData>)}
            disabled={true}
          />
        );
      case 3:
        return (
          <Step3Prazos
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4: 
        return (
          <MultiSelectAssinantes
          selectedResponsavelIds={formData.idsAssinantes || []}
          onSelectionChange={
            (idsAssinantes) => updateFormData({ idsAssinantes } as Partial<TramitacaoFormData>)
          }
          label="Selecione os validadores em 'Em Assinatura Diretoria' *"
          />
        );
      case 5:
        return (
          <Step4Obrigacao
            formData={formData}
            updateFormData={(data) => updateFormData({ ...formData, ...data } as Partial<TramitacaoFormData>)}
            anexos={formData.anexos || []}
            onAnexosChange={(anexos) => updateFormData({ ...formData, anexos } as Partial<TramitacaoFormData>)}
          />
        );
      case 6:
        return <Step6Resumo formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] h-[89vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Encaminhar para tramitação
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={setCurrentStep}
            canNavigateToStep={canNavigateToStep}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <CaretLeftIcon className="h-4 w-4" />
            Etapa Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                <CaretRightIcon className="h-4 w-4" />
                Próxima etapa
              </Button>
            ) : (
              <Button onClick={handleConfirm} className="flex items-center gap-2">
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}