'use client';

import {useEffect, useState} from 'react';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import {cn} from '@/utils/utils';
import {CheckIcon} from '@phosphor-icons/react';

interface MultiSelectAssinantesProps {
  selectedResponsavelIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectAssinantes({
  selectedResponsavelIds,
  onSelectionChange,
  label = "Assinantes",
  className,
  disabled
}: MultiSelectAssinantesProps) {
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [responsaveisResponse] = await Promise.all([
          responsaveisClient.buscarPorIdPerfil([1, 3])
        ]);

        const responsaveisAtivos = responsaveisResponse.filter((resp: ResponsavelResponse) => resp.flAtivo === 'S');

        setResponsaveis(responsaveisAtivos);
      } catch {
        setResponsaveis([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleResponsavelToggle = (responsavelId: number) => {
    if (disabled) return;

    const isSelected = selectedResponsavelIds.includes(responsavelId);
    const maxSelections = 2;

    if (isSelected) {
      onSelectionChange(selectedResponsavelIds.filter(id => id !== responsavelId));
    } else {
      if (selectedResponsavelIds.length < maxSelections) {
        onSelectionChange([...selectedResponsavelIds, responsavelId]);
      }
    }
  };


  return (
    <div
      className={cn("space-y-4", className, disabled && "pointer-events-none")}
      aria-disabled={disabled || undefined}
    >
      <Label
        className={cn(disabled && 'opacity-50 mb-4')}
      >{label}</Label>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-gray-500">Buscando assinantes...</div>
        </div>
      ) : (
        <div
          className={cn("mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto", disabled && "pointer-events-none")}
          aria-disabled={disabled || undefined}
        >
          {responsaveis.map((responsavel) => {
            const isChecked = selectedResponsavelIds.includes(responsavel.idResponsavel);
            const isMaxReached = selectedResponsavelIds.length >= 2 && !isChecked;
            const isDisabled = disabled || isMaxReached;
            
            return (
              <div
                key={responsavel.idResponsavel}
                className={cn(
                  "flex flex-row items-start gap-2 justify-between p-3 box-border rounded-3xl transition-colors min-w-0",
                  isDisabled
                    ? isChecked
                      ? "bg-gray-50 opacity-80 cursor-not-allowed"
                      : "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "bg-gray-100 cursor-pointer hover:bg-gray-100"
                )}
                onClick={() => handleResponsavelToggle(responsavel.idResponsavel)}
                onKeyDown={(e) => { if (isDisabled) e.preventDefault(); }}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled || undefined}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isDisabled
                        ? (isChecked ? 'bg-blue-400 border-blue-400' : 'border-gray-200 bg-gray-100')
                        : (isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300')
                    }`}
                    aria-disabled={isDisabled || undefined}
                  >
                    {isChecked && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isDisabled ? (isChecked ? "text-gray-600" : "text-gray-400") : "text-gray-700"
                  )}>
                    {responsavel.nmResponsavel}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 flex-shrink-0 text-xs border-none text-foreground",
                    isDisabled ? (isChecked ? "bg-gray-200 opacity-80" : "bg-gray-200 opacity-60") : "bg-gray-200"
                  )}
                >
                  {responsavel.nmPerfil}
                </Badge>
              </div>
            );
          })}
          {responsaveis?.length === 0 && !loading && (
            <div className="text-sm text-gray-500 p-4 text-center col-span-3">
              Nenhuma assinante encontrado
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        {selectedResponsavelIds?.length || 0}/2 validador(es)/assinante(s) selecionado(s)
        {selectedResponsavelIds?.length >= 2 && (
          <span className="text-blue-600 ml-2">(Máximo atingido - desmarque para selecionar outros)</span>
        )}
      </div>
    </div>
  );
}
