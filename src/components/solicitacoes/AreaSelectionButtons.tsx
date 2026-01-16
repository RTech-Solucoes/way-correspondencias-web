'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';
import { Check } from '@phosphor-icons/react';

export interface Area {
  idArea: number;
  nmArea: string;
}

interface AreaSelectionButtonsProps {
  areas: Area[];
  selectedAreaId: number | null;
  onAreaSelect: (areaId: number | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
}

export function AreaSelectionButtons({
  areas,
  selectedAreaId,
  onAreaSelect,
  disabled = false,
  label = 'Selecione para qual área você está respondendo?',
  className,
}: AreaSelectionButtonsProps) {
  if (areas.length === 0) {
    return null;
  }

  const handleAreaClick = (areaId: number) => {
    if (disabled) return;
    
    if (selectedAreaId === areaId) {
      // Permite deselecionar clicando no botão selecionado
      onAreaSelect(null);
    } else {
      onAreaSelect(areaId);
    }
  };

  return (
    <div className={cn('mb-4', className)}>
      <Label className="text-sm font-medium mb-3 block">
        {label}
      </Label>
      <div className="flex flex-wrap gap-3">
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.idArea;
          const hasSelection = selectedAreaId !== null;
          const isInactive = disabled || (hasSelection && !isSelected);

          return (
            <button
              key={area.idArea}
              type="button"
              onClick={() => handleAreaClick(area.idArea)}
              disabled={disabled}
              className={cn(
                'relative w-[300px] px-4 py-3 rounded-full',
                'flex items-center gap-3',
                'bg-gray-50 border border-gray-200',
                'transition-all duration-200 ease-in-out',
                isSelected && 'bg-blue-50 border-blue-300 shadow-sm',
                disabled && 'cursor-not-allowed',
                !disabled && !isInactive && 'hover:bg-gray-100 hover:border-gray-300 cursor-pointer',
                !disabled && isSelected && 'hover:bg-blue-100 hover:border-blue-400'
              )}
              title={area.nmArea}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full',
                  'flex items-center justify-center',
                  'border-2 transition-all duration-200',
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-transparent border-gray-300',
                  disabled && 'border-gray-200'
                )}
              >
                {isSelected && (
                  <Check
                    size={14}
                    weight="bold"
                    className="text-white"
                  />
                )}
              </div>

              <span
                className={cn(
                  'flex-1 min-w-0 text-left font-medium text-sm uppercase',
                  'text-gray-900 truncate',
                  disabled && 'text-gray-400'
                )}
              >
                {area.nmArea}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}