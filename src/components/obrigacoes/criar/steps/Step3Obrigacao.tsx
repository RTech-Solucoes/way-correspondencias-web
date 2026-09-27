'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoriaEnum, StatusAtivo, TipoEnum, TipoResponse } from '@/api/tipos/types';
import tiposClient from '@/api/tipos/client';
import { CalendarIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { statusList } from '@/api/status-solicitacao/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface Step3ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  disabled?: boolean;

  recorrenciaDisabled?: boolean;

  datasBloqueadas?: boolean;
  onValidationChange?: (hasErrors: boolean) => void;
  idStatusObrigacao?: number | null;
}

type TipoFrequencia = 'unica' | 'recorrente' | null;

const TOOLTIP_DATAS_RECORRENCIA =
  'Não é possível editar. A alteração pode impactar a recorrência: a data de início define o dia de cada ocorrência, e o intervalo até o término e a data limite é copiado para as obrigações geradas.';

export function Step3Obrigacao({ formData, updateFormData, disabled = false, recorrenciaDisabled = false, datasBloqueadas = false, onValidationChange, idStatusObrigacao }: Step3ObrigacaoProps) {

  const [periodicidadesSelecionadas, setPeriodicidadesSelecionadas] = useState<TipoResponse[]>([]);
  const [tipoUnica, setTipoUnica] = useState<TipoResponse | null>(null);
  const [loadingTipos, setLoadingTipos] = useState<boolean>(false);
  const [tipoFrequencia, setTipoFrequencia] = useState<TipoFrequencia>(null);

  useEffect(() => {
    const carregarTipos = async () => {
        setLoadingTipos(true);
        try {
            const tipos = await tiposClient.buscarPorCategorias([
                CategoriaEnum.OBRIG_PERIODICIDADE,
            ]);
            
            const unica = tipos.find(t => t.cdTipo === TipoEnum.UNICA && t.flAtivo === StatusAtivo.S);
            setTipoUnica(unica || null);
            
            const periodic = tipos
                .filter(t => t.nmCategoria === CategoriaEnum.OBRIG_PERIODICIDADE)
                .filter(t => t.flAtivo === StatusAtivo.S && t.cdTipo !== TipoEnum.UNICA);
          
            setPeriodicidadesSelecionadas(periodic);
            
            if (formData.idTipoPeriodicidade) {
              if (unica && formData.idTipoPeriodicidade === unica.idTipo) {
                setTipoFrequencia('unica');
              } else {
                setTipoFrequencia('recorrente');
              }
            }
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
        } finally {
            setLoadingTipos(false);
        }
    };
    
    carregarTipos();
}, [formData.idTipoPeriodicidade]);

  const erroDataTermino = useMemo(() => {
    if (formData.dtInicio && formData.dtTermino) {
      const dataInicio = new Date(formData.dtInicio);
      const dataTermino = new Date(formData.dtTermino);
      
      if (dataTermino < dataInicio) {
        return 'A data de término deve ser maior que a data de início';
      }
    }
    return null;
  }, [formData.dtInicio, formData.dtTermino]);

  const erroDataLimite = useMemo(() => {
    if (formData.dtTermino && formData.dtLimite) {
      const dataTermino = new Date(formData.dtTermino);
      const dataLimite = new Date(formData.dtLimite);
      
      if (dataLimite < dataTermino) {
        return 'A data limite deve ser maior que a data de término';
      }
    }
    return null;
  }, [formData.dtTermino, formData.dtLimite]);

  useEffect(() => {
    if (onValidationChange) {
      const hasErrors = !!(erroDataTermino || erroDataLimite);
      onValidationChange(hasErrors);
    }
  }, [erroDataTermino, erroDataLimite, onValidationChange]);

  useEffect(() => {
    if (formData.dtInicio && formData.dtTermino) {
      const dataInicio = new Date(formData.dtInicio);
      const dataTermino = new Date(formData.dtTermino);
      
      const diferencaEmMs = dataTermino.getTime() - dataInicio.getTime();
      const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));
      
      if (diferencaEmDias !== formData.nrDuracaoDias) {
        updateFormData({ nrDuracaoDias: diferencaEmDias > 0 ? diferencaEmDias : 0 });
      }
    }
  }, [formData.dtInicio, formData.dtTermino, updateFormData, formData.nrDuracaoDias]);
  const handleFrequenciaChange = (tipo: TipoFrequencia) => {
    setTipoFrequencia(tipo);
    
    if (tipo === 'unica' && tipoUnica) {
      updateFormData({ 
        idTipoPeriodicidade: tipoUnica.idTipo 
      });
    } else if (tipo === 'recorrente') {
      updateFormData({ 
        idTipoPeriodicidade: undefined 
      });
    }
  };

  const isPermitidoEditarDtLimite = useMemo(() => {
    if (!idStatusObrigacao) return true;
    return [statusList.NAO_INICIADO.id, statusList.PENDENTE.id].includes(idStatusObrigacao);
  }, [idStatusObrigacao]);

  // Considera só a periodicidade que já veio salva. Escolher Única/Recorrente agora
  // não pode travar os campos no meio do preenchimento.
  const periodicidadeInicialRef = useRef<number | null | undefined>(undefined);
  if (periodicidadeInicialRef.current === undefined) {
    periodicidadeInicialRef.current = formData.idTipoPeriodicidade ?? null;
  }
  const periodicidadeInicial = periodicidadeInicialRef.current;
  const recorrenciaJaSalva = recorrenciaDisabled && periodicidadeInicial != null;
  const recorrenciaBloqueada = disabled || recorrenciaJaSalva;
  const eraRecorrente =
    recorrenciaJaSalva && tipoUnica != null && periodicidadeInicial !== tipoUnica.idTipo;
  const datasTravadasPorRecorrencia = datasBloqueadas && eraRecorrente && !disabled;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Qual será a frequência da obrigação? <span className="text-red-500">*</span></Label>
        {recorrenciaBloqueada && !disabled && (
          <p className="text-sm text-gray-500">
            A frequência e a periodicidade são definidas no cadastro da obrigação e não podem ser alteradas.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => !recorrenciaBloqueada && handleFrequenciaChange('unica')}
            className={`
              border-2 rounded-lg p-4 transition-all
              ${recorrenciaBloqueada
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'cursor-pointer border-gray-200 hover:border-gray-300'
              }
              ${tipoFrequencia === 'unica'
                ? 'border-blue-500 bg-blue-50'
                : ''
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-6 w-6 text-gray-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Única</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Escolha uma data de início e fim.
                  </p>
                </div>
              </div>
              <div className={`
                h-5 w-5 rounded-full border-2 flex items-center justify-center
                ${tipoFrequencia === 'unica' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {tipoFrequencia === 'unica' && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => !recorrenciaBloqueada && handleFrequenciaChange('recorrente')}
            className={`
              border-2 rounded-lg p-4 transition-all
              ${recorrenciaBloqueada
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'cursor-pointer border-gray-200 hover:border-gray-300'
              }
              ${tipoFrequencia === 'recorrente'
                ? 'border-blue-500 bg-blue-50'
                : ''
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <ArrowClockwiseIcon className="h-6 w-6 text-gray-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Recorrente</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Defina a periodicidade e frequência.
                  </p>
                </div>
              </div>
              <div className={`
                h-5 w-5 rounded-full border-2 flex items-center justify-center
                ${tipoFrequencia === 'recorrente' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {tipoFrequencia === 'recorrente' && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Defina os prazos</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="nrDuracaoDias" className="text-sm font-medium text-gray-700">
                  Duração em dias:
                </Label>
                <span className="text-sm font-semibold text-green-500">
                  {formData.nrDuracaoDias || 0} dias
                </span>
              </div>
            </div>
            
            {tipoFrequencia === 'recorrente' && (
              <div className="space-y-2">
                <Label htmlFor="idTipoPeriodicidade">Periodicidade <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.idTipoPeriodicidade?.toString() || ''}
                  onValueChange={(value) => {
                    updateFormData({ 
                      idTipoPeriodicidade: parseInt(value)
                    });
                  }}
                  disabled={recorrenciaBloqueada || loadingTipos}
                >
                  <SelectTrigger id="idTipoPeriodicidade">
                    <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione'} />
                  </SelectTrigger>
                  <SelectContent>
                    {periodicidadesSelecionadas.map((tipo) => (
                      <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                        {tipo.dsTipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {datasTravadasPorRecorrencia && (
              <p className="text-sm text-gray-500">{TOOLTIP_DATAS_RECORRENCIA}</p>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"> 
                <Label htmlFor="dtInicio">Data de Início <span className="text-red-500">*</span></Label>
                <CampoDataComTooltip
                  id="dtInicio"
                  value={formData.dtInicio || ''}
                  onChange={(value) => updateFormData({ dtInicio: value })}
                  disabled={disabled || datasTravadasPorRecorrencia}
                  tooltip={datasTravadasPorRecorrencia ? TOOLTIP_DATAS_RECORRENCIA : null}
                />
              </div>

              <div className="space-y-2"> 
                <Label htmlFor="dtTermino">Data de Término <span className="text-red-500">*</span></Label>
                <CampoDataComTooltip
                  id="dtTermino"
                  value={formData.dtTermino || ''}
                  onChange={(value) => updateFormData({ dtTermino: value })}
                  disabled={disabled || datasTravadasPorRecorrencia}
                  className={erroDataTermino ? 'border-red-500' : ''}
                  tooltip={datasTravadasPorRecorrencia ? TOOLTIP_DATAS_RECORRENCIA : null}
                />
                {erroDataTermino && (
                  <p className="text-sm text-red-500 mt-1">{erroDataTermino}</p>
                )}
              </div>

              <div className="space-y-2"> 
                <Label htmlFor="dtLimite">Data Limite <span className="text-red-500">*</span></Label>
                <CampoDataComTooltip
                  id="dtLimite"
                  value={formData.dtLimite || ''}
                  onChange={(value) => updateFormData({ dtLimite: value })}
                  disabled={disabled || datasTravadasPorRecorrencia || !isPermitidoEditarDtLimite}
                  className={erroDataLimite ? 'border-red-500' : ''}
                  tooltip={
                    datasTravadasPorRecorrencia
                      ? TOOLTIP_DATAS_RECORRENCIA
                      : !isPermitidoEditarDtLimite
                        ? 'A data limite só pode ser alterada quando o status for "Não Iniciado" ou "Pendente".'
                        : null
                  }
                />
                {erroDataLimite && (
                  <p className="text-sm text-red-500 mt-1">{erroDataLimite}</p>
                )}
              </div>
            </div>
          </div>
    </div>
  );
}

function CampoDataComTooltip({
  id,
  value,
  onChange,
  disabled,
  className,
  tooltip,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
  tooltip: string | null;
}) {
  const input = (
    <Input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    />
  );

  if (!tooltip) return input;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{input}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

