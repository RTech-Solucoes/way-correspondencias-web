'use client';

import {useEffect, useState} from 'react';
import {Label} from '@/components/ui/label';
import {ConcessionariaResponse} from '@/api/concessionaria/types';
import concessionariaClient from '@/api/concessionaria/client';
import {cn} from '@/utils/utils';
import {CheckIcon} from '@phosphor-icons/react';
import { perfilUtil } from '@/api/perfis/types';
import { useUserGestao } from '@/hooks/use-user-gestao';

interface MultiSelectConcessionariasProps {
  selectedConcessionariaIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectConcessionarias({
  selectedConcessionariaIds,
  onSelectionChange,
  label = "Concessionárias",
  className,
  disabled
}: MultiSelectConcessionariasProps) {
  const [concessionarias, setConcessionarias] = useState<ConcessionariaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { idPerfil, loading: loadingPerfil } = useUserGestao();

  useEffect(() => {
    const loadData = async () => {
      if (loadingPerfil) return;

      try {
        setLoading(true);
        const response = idPerfil === perfilUtil.SUPER_ADMIN 
          ? await concessionariaClient.buscarTodas()
          : await concessionariaClient.buscarPorIdResponsavelLogado();
        setConcessionarias(response);
      } catch {
        setConcessionarias([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idPerfil, loadingPerfil]);

  const handleConcessionariaToggle = (concessionariaId: number) => {
    if (disabled) return;

    const isSelected = selectedConcessionariaIds.includes(concessionariaId);

    if (isSelected) {
      onSelectionChange(selectedConcessionariaIds.filter(id => id !== concessionariaId));
    } else {
      onSelectionChange([...selectedConcessionariaIds, concessionariaId]);
    }
  };

  return (
    <div
      className={cn("space-y-4", className, disabled && "pointer-events-none")}
      aria-disabled={disabled || undefined}
    >
      <Label
        className={cn(disabled && 'opacity-50')}
      >{label}</Label>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-gray-500">Buscando concessionárias...</div>
        </div>
      ) : (
        <div
          className={cn("mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto", disabled && "pointer-events-none")}
          aria-disabled={disabled || undefined}
        >
          {concessionarias.map((concessionaria) => {
            const isChecked = selectedConcessionariaIds.includes(concessionaria.idConcessionaria);
            return (
              <div
                key={concessionaria.idConcessionaria}
                className={cn(
                  "flex flex-row items-start gap-2 justify-between p-3 box-border rounded-3xl transition-colors min-w-0",
                  disabled
                    ? isChecked
                      ? "bg-gray-50 opacity-80 cursor-not-allowed"
                      : "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "bg-gray-100 cursor-pointer hover:bg-gray-200"
                )}
                onClick={() => handleConcessionariaToggle(concessionaria.idConcessionaria)}
                onKeyDown={(e) => { if (disabled) e.preventDefault(); }}
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled || undefined}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      disabled
                        ? (isChecked ? 'bg-blue-400 border-blue-400' : 'border-gray-200 bg-gray-100')
                        : (isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300')
                    }`}
                    aria-disabled={disabled || undefined}
                  >
                    {isChecked && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    disabled ? (isChecked ? "text-gray-600" : "text-gray-400") : "text-gray-700"
                  )}>
                    {concessionaria.nmConcessionaria}
                  </span>
                </div>
              </div>
            );
          })}
          {concessionarias?.length === 0 && !loading && (
            <div className="text-sm text-gray-500 p-4 text-center col-span-3">
              Nenhuma concessionária encontrada
            </div>
          )}
        </div>
      )}
      {selectedConcessionariaIds?.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {selectedConcessionariaIds?.length} concessionária(s) selecionada(s)
        </div>
      )}
    </div>
  );
}

