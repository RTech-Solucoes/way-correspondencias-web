'use client';

import { Label } from '@/components/ui/label';
import type { SolicitacaoRequest } from '@/api/solicitacoes/types';
import type { ResponsavelResponse } from '@/api/responsaveis/types';

interface Step5ResumoProps {
  formData: SolicitacaoRequest;
  responsaveis: ResponsavelResponse[];
  getSelectedTema: () => { nmTema: string } | undefined;
  anexosCount: number;
}

export default function Step5Resumo({ formData, responsaveis, getSelectedTema, anexosCount }: Step5ResumoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código de Identificação</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">{formData.cdIdentificacao}</div>
          </div>
          <div>
            <Label>Tema</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">{getSelectedTema()?.nmTema}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Responsável</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {responsaveis.find((r) => r.idResponsavel === formData.idResponsavel)?.nmResponsavel || 'N/A'}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">{formData.flStatus}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prazos</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {formData.nrPrazo ? `${formData.nrPrazo} horas` : 'Não definido'}{' '}
              {formData.tpPrazo === 'U' ? '(Horas úteis)' : formData.tpPrazo === 'C' ? '(Horas corridas)' : ''}
            </div>
          </div>
          <div>
            <Label>Anexos</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">{anexosCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
