'use client';

import { ObrigacaoFormData } from '../ObrigacaoModal';
import { StatusObrigacao, statusObrigacaoLabels, statusObrigacaoList } from '@/api/status-obrigacao/types';
import { AnexoResponse } from '@/api/anexos/type';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { 
  classificacaoLabels, 
  periodicidadeLabels, 
  criticidadeLabels, 
  naturezaLabels,
  ClassificacaoEnum,
  PeriodicidadeEnum,
  CriticidadeEnum,
  NaturezaEnum
} from '@/api/obrigacao-contratual/enums';

interface Step6ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData?: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step6Obrigacao({ formData }: Step6ObrigacaoProps) {

  const [anexosBackend] = useState<AnexoResponse[]>([]);
  const [areaAtribuidaNome, setAreaAtribuidaNome] = useState<string>('');
  const [areasCondicionantesNomes, setAreasCondicionantesNomes] = useState<string[]>([]);
  const [temaNome, setTemaNome] = useState<string>('');

  useEffect(() => {

    if (formData?.idAreaAtribuida) {
      setAreaAtribuidaNome(`Área #${formData.idAreaAtribuida}`);
    }
    if (formData?.idsAreasCondicionantes && formData.idsAreasCondicionantes.length > 0) {
      setAreasCondicionantesNomes(
        formData.idsAreasCondicionantes.map(id => `Área #${id}`)
      );
    }
    if (formData?.idTema) {
      setTemaNome(`Tema #${formData.idTema}`);
    }
  }, [formData]);

  const getStatusLabel = () => {
    const current = statusObrigacaoList.find((s) => s.id === formData?.idStatusObrigacao);
    return current ? statusObrigacaoLabels[current.nmStatus as StatusObrigacao] : 'Não Iniciado';
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-gray-700">Código Identificador</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {formData?.cdIdentificador || 'Não informado'}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Tarefa</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {formData?.dsTarefa || 'Não informado'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Status</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {getStatusLabel()}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Classificação</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData?.tpClassificacao 
              ? classificacaoLabels[formData.tpClassificacao as ClassificacaoEnum]
              : 'Não informado'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Periodicidade</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData?.tpPeriodicidade 
              ? periodicidadeLabels[formData.tpPeriodicidade as PeriodicidadeEnum]
              : 'Não informado'}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Criticidade</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData?.tpCriticidade 
              ? criticidadeLabels[formData.tpCriticidade as CriticidadeEnum]
              : 'Não informado'}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Natureza</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData?.tpNatureza 
              ? naturezaLabels[formData.tpNatureza as NaturezaEnum]
              : 'Não informado'}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Comentários</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2 whitespace-pre-wrap">
          {formData?.dsObservacao || 'Não informado'}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Tema</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {temaNome || 'Não informado'}
        </div>
      </div>

      {formData?.idAreaAtribuida && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Área Atribuída</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{areaAtribuidaNome}</span>
                <span className="text-xs text-gray-500">RH</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-600">
                  Responsável da Área
                </span>
                <div className="text-xs text-gray-500">
                  email@exemplo.com.br
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData?.idsAreasCondicionantes && formData.idsAreasCondicionantes.length > 0 && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Áreas Condicionantes</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            <div className="space-y-3">
              {areasCondicionantesNomes.map((areaNome, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{areaNome}</span>
                    <span className="text-xs text-gray-500">
                      {formData.idsAreasCondicionantes ? `ID: ${formData.idsAreasCondicionantes[index]}` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600">
                      Responsável da Área
                    </span>
                    <div className="text-xs text-gray-500">
                      email@exemplo.com.br
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!formData?.idAreaAtribuida && (!formData?.idsAreasCondicionantes || formData.idsAreasCondicionantes.length === 0) && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Áreas Envolvidas</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            <p className="text-gray-500">Nenhuma área selecionada</p>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="grid grid-cols-4 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data de Início</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {formatDate(formData?.dtInicio)}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data de Término</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formatDate(formData?.dtTermino)}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data Limite</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formatDate(formData?.dtLimite)}
          </div>
          </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Numero de Dias</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData?.nrDuracaoDias ? `${formData.nrDuracaoDias} dias` : 'Não informado'}
          </div>
        </div>
      </div>
       
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Vínculos</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <span className="text-xs text-gray-500 block mb-1">ANTT</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {formData?.dsAntt || 'Não informado'}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-1">Outro Protocolo Externo</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {formData?.dsProtocoloExterno || 'Não informado'}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-1">TAC</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {formData?.dsTac || 'Não informado'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Vínculo com Correspondência</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          Correspondência #{formData.idSolicitacao}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Obrigação recusada pelo Verificador ou ANTT</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
           #{formData.idObrigacaoContratualVinculo}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Obrigação Principal</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
           #{formData.idObrigacaoContratualPai}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexosBackend.length})</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          <p className="text-gray-500">Nenhum anexo adicionado</p>
        </div>
      </div>
    
    </div>
  );
}
