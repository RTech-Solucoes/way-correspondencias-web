'use client';

import {useEffect, useState} from 'react';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {AreaExecutorAvancadoResponse} from '@/api/areas/types';
import {areasClient} from '@/api/areas/client';
import {cn} from '@/utils/utils';
import {CheckIcon} from '@phosphor-icons/react';

interface MultiSelectAreasProps {
  selectedAreaIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  maxSelection?: number;
  excludedAreaIds?: number[]; 
}

export function MultiSelectAreas({
  selectedAreaIds,
  onSelectionChange,
  label = "Áreas",
  className,
  disabled,
  maxSelection,
  excludedAreaIds = []
}: MultiSelectAreasProps) {
  const [areaExecutorAvancado, setAreaExecutorAvancado] = useState<AreaExecutorAvancadoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [areaResponse] = await Promise.all([
          areasClient.buscarPorExecutorAvancado(),
        ]);
        setAreaExecutorAvancado(areaResponse);
      } catch {
        setAreaExecutorAvancado([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAreaToggle = (areaId: number) => {
    if (disabled) return;

    const isSelected = selectedAreaIds.includes(areaId);

    if (isSelected) {
      onSelectionChange(selectedAreaIds.filter(id => id !== areaId));
    } else {
      if (maxSelection && selectedAreaIds.length >= maxSelection) {
        if (maxSelection === 1) {
          onSelectionChange([areaId]);
        }
        return;
      }
      onSelectionChange([...selectedAreaIds, areaId]);
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
          <div className="text-sm text-gray-500">Buscando áreas...</div>
        </div>
      ) : (
        <div
          className={cn("mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto", disabled && "pointer-events-none")}
          aria-disabled={disabled || undefined}
        >
          {areaExecutorAvancado
            .filter((area) => !excludedAreaIds.includes(area.idArea))
            .map((area) => {
            const isChecked = selectedAreaIds.includes(area.idArea);
            return (
              <div
                key={area.idArea}
                className={cn(
                  "flex flex-row items-start gap-2 justify-between p-3 box-border rounded-3xl transition-colors min-w-0",
                  disabled
                    ? isChecked
                      ? "bg-gray-50 opacity-80 cursor-not-allowed"
                      : "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "bg-gray-100 cursor-pointer hover:bg-gray-100"
                )}
                onClick={() => handleAreaToggle(area.idArea)}
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
                    {area.nmArea}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 flex-shrink-0 text-xs border-none text-foreground",
                    disabled ? (isChecked ? "bg-gray-200 opacity-80" : "bg-gray-200 opacity-60") : "bg-gray-200"
                  )}
                >
                  {area.nmResponsavel || 'N/A'}
                </Badge>
              </div>
            );
          })}
          {areaExecutorAvancado?.length === 0 && !loading && (
            <div className="text-sm text-gray-500 p-4 text-center col-span-3">
              Nenhuma área encontrada
            </div>
          )}
        </div>
      )}
      {selectedAreaIds?.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {selectedAreaIds?.length} área(s) selecionada(s)
        </div>
      )}
    </div>
  );
}
