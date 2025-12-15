'use client';

import { MultiSelectAssinantes } from '@/components/ui/multi-select-assinates';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';

interface Step4AssinantesProps {
  formData: TramitacaoFormData;
  updateFormData: (data: Partial<TramitacaoFormData>) => void;
}

export function Step4Assinantes({ formData, updateFormData }: Step4AssinantesProps) {
  const handleAssinantesChange = (selectedIds: number[]) => {
    updateFormData({ idsAssinantes: selectedIds });
  };

  return (
    <div className="space-y-6">
      {/* <MultiSelectAssinantes
        selectedResponsavelIds={formData.idsAssinantes || []}
        onSelectionChange={handleAssinantesChange}
        label="Selecione os assinantes*"
      /> */}
    </div>
  );
}

