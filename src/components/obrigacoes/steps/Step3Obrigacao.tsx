'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoriaEnum, StatusAtivo, TipoEnum, TipoResponse } from '@/api/tipos/types';
import tiposClient from '@/api/tipos/client';
import { CalendarIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';


interface Step3ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
}

type TipoFrequencia = 'unica' | 'recorrente' | null;

export function Step3Obrigacao({ formData, updateFormData }: Step3ObrigacaoProps) {

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
      
      if (dataTermino <= dataInicio) {
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
    if (formData.dtInicio && formData.dtTermino) {
      const dataInicio = new Date(formData.dtInicio);
      const dataTermino = new Date(formData.dtTermino);
      
      const diferencaEmMs = dataTermino.getTime() - dataInicio.getTime();
      const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));
      
      if (diferencaEmDias !== formData.nrDuracaoDias) {
        updateFormData({ nrDuracaoDias: diferencaEmDias > 0 ? diferencaEmDias : 0 });
      }
    }
  }, [formData.dtInicio, formData.dtTermino]);
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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Qual será a frequência da obrigação?</Label>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => handleFrequenciaChange('unica')}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${tipoFrequencia === 'unica' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
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
            onClick={() => handleFrequenciaChange('recorrente')}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${tipoFrequencia === 'recorrente' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
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

        {tipoFrequencia && (
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
                <Label htmlFor="idTipoPeriodicidade">Periodicidade*</Label>
                <Select
                  value={formData.idTipoPeriodicidade?.toString() || ''}
                  onValueChange={(value) => {
                    updateFormData({ 
                      idTipoPeriodicidade: parseInt(value)
                    });
                  }}
                  disabled={loadingTipos}
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
          </div>
        )}
    </div>
  );
}

