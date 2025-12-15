'use client';

import { Label } from '@/components/ui/label';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';
import { formatDateBr } from '@/utils/utils';

interface Step6ResumoProps {
  formData: TramitacaoFormData;
}

const getAprovacaoLabel = (value?: string) => {
  switch ((value || '').toUpperCase()) {
    case 'G':
      return 'Gerente';
    case 'D':
      return 'Diretor';
    case 'A':
      return 'Ambos';
    case 'N':
      return 'Não necessita';
    default:
      return '—';
  }
};

const getManifestacaoLabel = (value?: string) => {
  switch ((value || '').toUpperCase()) {
    case 'S':
      return 'Sim';
    case 'N':
      return 'Não, apenas ciência';
    default:
      return '—';
  }
};

export function Step6Resumo({ formData }: Step6ResumoProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos dados</h3>

      </div>
    </div>
  );
}

