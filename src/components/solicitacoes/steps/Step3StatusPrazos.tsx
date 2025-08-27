'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { StatusSolicPrazoTemaResponse } from '@/api/status-prazo-tema/types';
import { SolicitacaoRequest } from '@/api/solicitacoes/types';

interface Step3StatusPrazosProps {
  formData: SolicitacaoRequest;
  prazoExcepcional: boolean;
  loadingStatusPrazos: boolean;
  statusPrazos: StatusSolicPrazoTemaResponse[];
  onTogglePrazoExcepcional: (checked: boolean) => void;
  onPrazoFieldChange: (name: 'nrPrazo' | 'tpPrazo', value: string) => void;
  onUpdateLocalPrazo: (statusCodigo: string, valor: number) => void;
}

const statusOptions = [
  { codigo: 'P', nome: 'Pré-análise' },
  { codigo: 'V', nome: 'Vencido Regulatório' },
  { codigo: 'A', nome: 'Em análise Área Técnica' },
  { codigo: 'T', nome: 'Vencido Área Técnica' },
  { codigo: 'R', nome: 'Análise Regulatória' },
  { codigo: 'O', nome: 'Em Aprovação' },
  { codigo: 'S', nome: 'Em Assinatura' },
  { codigo: 'C', nome: 'Concluído' },
  { codigo: 'X', nome: 'Arquivado' },
];

export default function Step3StatusPrazos({
  formData,
  prazoExcepcional,
  loadingStatusPrazos,
  statusPrazos,
  onTogglePrazoExcepcional,
  onPrazoFieldChange,
  onUpdateLocalPrazo,
}: Step3StatusPrazosProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox id="prazoExcepcional" checked={prazoExcepcional} onCheckedChange={(c) => onTogglePrazoExcepcional(!!c)} />
        <Label htmlFor="prazoExcepcional" className="text-sm font-medium text-gray-700">Prazo Excepcional</Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="nrPrazo"
          label="Prazo"
          name="nrPrazo"
          type="number"
          value={formData.nrPrazo && formData.nrPrazo > 0 ? String(formData.nrPrazo) : ''}
          onChange={(e) => onPrazoFieldChange('nrPrazo', e.target.value)}
          placeholder="Horas"
          disabled={!prazoExcepcional}
        />

        <div className="flex flex-col gap-1">
          <Label htmlFor="tpPrazo">Tipo de Prazo</Label>
          <Select value={formData.tpPrazo || ''} onValueChange={(v) => onPrazoFieldChange('tpPrazo', v)} disabled={!prazoExcepcional}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U">Horas úteis</SelectItem>
              <SelectItem value="C">Horas corridas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.idTema && (
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração de Prazos Internos</h3>
          <div className="space-y-4">
            {loadingStatusPrazos ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Carregando configurações...</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {statusOptions.map((status) => {
                  const prazoConfig = statusPrazos.find((p) => String(p.statusCodigo) === status.codigo);
                  const prazoAtual = prazoConfig?.nrPrazoInterno || 0;
                  return (
                    <div key={status.codigo} className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{status.nome}</h4>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600">Prazo Interno (horas)</Label>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => onUpdateLocalPrazo(status.codigo, Math.max(0, prazoAtual - 1))} className="w-8 h-8 p-0 flex items-center justify-center">-</Button>
                            <TextField
                              key={`prazo-${status.codigo}`}
                              type="number"
                              value={String(prazoAtual)}
                              onChange={(e) => onUpdateLocalPrazo(status.codigo, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="flex-1 text-center"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => onUpdateLocalPrazo(status.codigo, prazoAtual + 1)} className="w-8 h-8 p-0 flex items-center justify-center">+</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}