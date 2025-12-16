'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { statusSolicitacaoClient, StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { STATUS_LIST, statusList as statusListType } from '@/api/status-solicitacao/types';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { hoursToDaysAndHours } from '@/utils/utils';
import { Input as NextUIInput } from '@nextui-org/react';
import { CategoriaEnum, TipoEnum } from '@/api/tipos/types';

interface Step3PrazosProps {
  formData: TramitacaoFormData;
  updateFormData: (data: Partial<TramitacaoFormData>) => void;
}

function horasParaDias(horas: number): number {
  return Math.floor(horas / 24);
}

const STATUS_OCULTOS = [
  statusListObrigacao.NAO_INICIADO.id,
  statusListObrigacao.PENDENTE.id,
  statusListObrigacao.EM_ANDAMENTO.id,
  statusListObrigacao.ATRASADA.id,
  statusListObrigacao.NAO_APLICAVEL_SUSPENSA.id,
  statusListObrigacao.EM_VALIDACAO_REGULATORIO.id,
  statusListType.PRE_ANALISE.id,
  statusListType.VENCIDO_REGULATORIO.id,
  statusListType.VENCIDO_AREA_TECNICA.id,
  statusListType.EM_ANALISE_AREA_TECNICA.id,
  statusListType.ARQUIVADO.id,
];

const DEFAULT_PRAZOS_POR_STATUS: { [key: number]: number } = {
  [statusListType.EM_ANALISE_GERENTE_REGULATORIO.id]: 48,
  [statusListType.EM_ANALISE_AREA_TECNICA.id]: 72,
  [statusListType.ANALISE_REGULATORIA.id]: 72,
  [statusListType.EM_APROVACAO.id]: 48,
  [statusListType.EM_ASSINATURA_DIRETORIA.id]: 48,
};

export function Step3Prazos({ formData, updateFormData }: Step3PrazosProps) {
  const [statusList, setStatusList] = useState<StatusSolicitacaoResponse[]>([]);
  const hasInitialized = useRef(false);

  const prazoExcepcional = (formData.flExcepcional || 'N') === 'S';

  useEffect(() => {
    const loadStatusList = async () => {
      try {
        const status = await statusSolicitacaoClient.listarTodos(
          CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO,
          [TipoEnum.TODOS, TipoEnum.OBRIGACAO]
        );
        setStatusList(status);
      } catch (error) {
        console.error('Erro ao carregar lista de status:', error);
      }
    };
    loadStatusList();
  }, []);

  const statusOptions = useMemo(() => {
    const allStatus = statusList.length > 0
      ? statusList.map(status => ({
          codigo: status.idStatusSolicitacao,
          nome: status.nmStatus,
        }))
      : STATUS_LIST.map(status => ({
          codigo: status.id,
          nome: status.label,
        }));

    return allStatus
      .filter(status => !STATUS_OCULTOS.includes(status.codigo))
      .sort((a, b) => {
        if (a.codigo === statusListType.EM_ANALISE_GERENTE_REGULATORIO.id) return -1;
        if (b.codigo === statusListType.EM_ANALISE_GERENTE_REGULATORIO.id) return 1;
        return a.codigo - b.codigo;
      });
  }, [statusList]);

  const statusPrazos = useMemo((): StatusSolicPrazoTemaForUI[] => {
    if (formData.statusPrazos && formData.statusPrazos.length > 0) {
      return formData.statusPrazos;
    }

    if (statusOptions.length > 0) {
      return statusOptions.map(status => ({
        idStatusSolicPrazoTema: 0,
        idStatusSolicitacao: status.codigo,
        nrPrazoInterno: DEFAULT_PRAZOS_POR_STATUS[status.codigo] || 0,
        nrPrazoExterno: 0,
        flAtivo: 'S',
      }));
    }

    return [];
  }, [formData.statusPrazos, statusOptions]);

  useEffect(() => {
    const shouldInitialize = !hasInitialized.current && 
                             statusPrazos.length > 0 && 
                             (!formData.statusPrazos || formData.statusPrazos.length === 0);
    
    if (shouldInitialize) {
      hasInitialized.current = true;
      updateFormData({ statusPrazos });
    }
  }, [statusPrazos.length, formData.statusPrazos?.length, updateFormData, formData, hasInitialized, statusPrazos]);

  const currentPrazoTotal = useMemo(() => {
    return statusPrazos.reduce((acc, curr) => acc + curr.nrPrazoInterno, 0);
  }, [statusPrazos]);

  const updateLocalPrazo = useCallback(
    (idStatus: number, valor: number) => {
      const updated = statusPrazos.map(p =>
        p.idStatusSolicitacao === idStatus
          ? { ...p, nrPrazoInterno: valor }
          : p
      );

      if (!updated.find(p => p.idStatusSolicitacao === idStatus)) {
        updated.push({
          idStatusSolicPrazoTema: 0,
          idStatusSolicitacao: idStatus,
          nrPrazoInterno: valor,
          nrPrazoExterno: 0,
          flAtivo: 'S',
        });
      }

      updateFormData({ statusPrazos: updated });
    },
    [statusPrazos, updateFormData]
  );

  const handlePrazoExcepcionalChange = useCallback(
    (checked: boolean) => {
      const ativo = !!checked;
      updateFormData({ flExcepcional: ativo ? 'S' : 'N' });

      if (!ativo) {
        const defaultPrazos = statusOptions.map(status => ({
          idStatusSolicPrazoTema: 0,
          idStatusSolicitacao: status.codigo,
          nrPrazoInterno: DEFAULT_PRAZOS_POR_STATUS[status.codigo] || 0,
          nrPrazoExterno: 0,
          flAtivo: 'S',
        }));
        updateFormData({ statusPrazos: defaultPrazos });
      }
    },
    [statusOptions, updateFormData]
  );

  if (statusOptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500 py-8">
          {statusList.length === 0 ? 'Carregando configurações...' : 'Nenhum status disponível para configuração.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center w-full gap-3">
            <h3 className="text-lg font-medium text-gray-900">Configuração de Prazos por Status</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                id="prazoExcepcional"
                checked={prazoExcepcional}
                onCheckedChange={handlePrazoExcepcionalChange}
              />
              <Label htmlFor="prazoExcepcional" className="text-sm font-medium text-blue-600">
                Prazo Excepcional
              </Label>
            </div>
            <h3 className="text-blue-500 font-bold ml-auto text-2xl">
              {prazoExcepcional ? `${currentPrazoTotal}h` : hoursToDaysAndHours(currentPrazoTotal)}
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {prazoExcepcional
            ? 'Modo excepcional ativo: Configure prazos personalizados para cada etapa abaixo. O prazo total será a soma de todos os prazos configurados.'
            : "Modo padrão: O prazo total será calculado com base nos prazos padrão de cada status. Ative o 'Prazo Excepcional' para personalizar prazos por status."}
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {statusOptions.map((status) => {
              const prazoAtual = statusPrazos.find(
                p => p.idStatusSolicitacao === status.codigo
              )?.nrPrazoInterno ?? DEFAULT_PRAZOS_POR_STATUS[status.codigo] ?? 0;

              return (
                <div key={status.codigo} className="rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-500">{status.nome}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const valorAtualExibido = prazoExcepcional
                              ? prazoAtual
                              : horasParaDias(prazoAtual);
                            const novoValor = Math.max(0, valorAtualExibido - 1);
                            const valorParaSalvar = prazoExcepcional ? novoValor : novoValor * 24;
                            updateLocalPrazo(status.codigo, valorParaSalvar);
                          }}
                          className="w-8 h-8 p-0 flex items-center justify-center"
                        >
                          -
                        </Button>
                        <NextUIInput
                          type="number"
                          value={(prazoExcepcional ? prazoAtual : horasParaDias(prazoAtual)).toString()}
                          onValueChange={(value) => {
                            const numValue = parseInt(value || '0');
                            if (numValue >= 0 && numValue <= 300) {
                              const valorParaSalvar = prazoExcepcional ? numValue : numValue * 24;
                              updateLocalPrazo(status.codigo, valorParaSalvar);
                            }
                          }}
                          placeholder="0"
                          isDisabled={false}
                          className="flex-1"
                          classNames={{
                            input: 'text-center',
                          }}
                          size="sm"
                          variant="bordered"
                          min={0}
                          max={300}
                          step={1}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const valorAtualExibido = prazoExcepcional
                              ? prazoAtual
                              : horasParaDias(prazoAtual);
                            const novoValor = Math.min(300, valorAtualExibido + 1);
                            const valorParaSalvar = prazoExcepcional ? novoValor : novoValor * 24;
                            updateLocalPrazo(status.codigo, valorParaSalvar);
                          }}
                          className="w-8 h-8 p-0 flex items-center justify-center"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
