'use client';

import { ChangeEvent } from 'react';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SolicitacaoRequest } from '@/api/solicitacoes/types';

interface Step1DadosProps {
  formData: SolicitacaoRequest;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function Step1Dados({ formData, onChange }: Step1DadosProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Código de Identificação *" name="cdIdentificacao" value={formData.cdIdentificacao} onChange={onChange} required autoFocus maxLength={50} />
        <TextField label="Assunto" name="dsAssunto" value={formData.dsAssunto} onChange={onChange} maxLength={500} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Nº Ofício" name="nrOficio" value={formData.nrOficio} onChange={onChange} maxLength={50} />
        <TextField label="Nº Processo" name="nrProcesso" value={formData.nrProcesso} onChange={onChange} maxLength={50} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsSolicitacao">Descrição da Solicitação</Label>
        <Textarea id="dsSolicitacao" name="dsSolicitacao" value={formData.dsSolicitacao} onChange={onChange} rows={3} maxLength={1000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações</Label>
        <Textarea id="dsObservacao" name="dsObservacao" value={formData.dsObservacao} onChange={onChange} rows={3} maxLength={1000} />
      </div>
    </div>
  );
}
