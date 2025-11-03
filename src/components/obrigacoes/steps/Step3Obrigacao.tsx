'use client';

import { useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Label } from '@radix-ui/react-label';


interface Step3ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step3Obrigacao({ formData, updateFormData }: Step3ObrigacaoProps) {

  const erroDataTermino = useMemo(() => {
    if (formData.dtInicio && formData.dtTermino) {
      const dataInicio = new Date(formData.dtInicio);
      const dataTermino = new Date(formData.dtTermino);
      
      if (dataTermino < dataInicio) {
        return 'A data de término não pode ser menor que a data de início';
      }
    }
    return null;
  }, [formData.dtInicio, formData.dtTermino]);

  const erroDataLimite = useMemo(() => {
    if (formData.dtTermino && formData.dtLimite) {
      const dataTermino = new Date(formData.dtTermino);
      const dataLimite = new Date(formData.dtLimite);
      
      if (dataLimite <= dataTermino) {
        return 'A data limite deve ser maior que a data de término';
      }
    }
    return null;
  }, [formData.dtTermino, formData.dtLimite]);

  useEffect(() => {
    if (formData.dtInicio && formData.dtTermino) {
      const dataInicio = new Date(formData.dtInicio);
      const dataTermino = new Date(formData.dtTermino);
      
      const diferencaEmMs = dataTermino.getTime() - dataInicio.getTime();
      const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));
      
      if (diferencaEmDias !== formData.nrDuracaoDias) {
        updateFormData({ nrDuracaoDias: diferencaEmDias >= 0 ? diferencaEmDias : 0 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dtInicio, formData.dtTermino]);
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"> 
          <Label htmlFor="dtInicio">Data de Início*</Label>
          <Input
            id="dtInicio"
            type="date"
            value={formData.dtInicio || ''}
            onChange={(e) => updateFormData({ dtInicio: e.target.value })}
          />
        </div>

        <div className="space-y-2"> 
          <Label htmlFor="dtTermino">Data de Término*</Label>
          <Input
            id="dtTermino"
            type="date"
            value={formData.dtTermino || ''}
            onChange={(e) => updateFormData({ dtTermino: e.target.value })}
            className={erroDataTermino ? 'border-red-500' : ''}
          />
          {erroDataTermino && (
            <p className="text-sm text-red-500 mt-1">{erroDataTermino}</p>
          )}
        </div>

        <div className="space-y-2"> 
          <Label htmlFor="dtLimite">Data Limite*</Label>
          <Input
            id="dtLimite"
            type="date"
            value={formData.dtLimite || ''}
            onChange={(e) => updateFormData({ dtLimite: e.target.value })}
            className={erroDataLimite ? 'border-red-500' : ''}
          />
          {erroDataLimite && (
            <p className="text-sm text-red-500 mt-1">{erroDataLimite}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2"> 
        <Label htmlFor="nrDuracaoDias">Duração (Dias)</Label>
        <Input
          id="nrDuracaoDias"
          type="number"
          value={formData.nrDuracaoDias || ''}
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
      </div>
    </div>
  );
}

