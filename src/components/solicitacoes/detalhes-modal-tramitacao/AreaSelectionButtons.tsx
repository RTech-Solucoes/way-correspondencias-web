'use client';

import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/utils';
import { CheckIcon } from '@phosphor-icons/react';


export interface Area {
  idArea: number;
  nmArea: string;
  disabled?: boolean; // Indica se esta área específica está desabilitada
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

  const handleAreaClick = (area: Area) => {
    // Bloqueia se o componente inteiro está desabilitado OU se a área específica está desabilitada
    if (disabled || area.disabled) return;
    
    if (selectedAreaId === area.idArea) {
      // Permite deselecionar clicando no botão selecionado
      onAreaSelect(null);
    } else {
      onAreaSelect(area.idArea);
    }
  };

  return (
    <div className={cn('mb-4', className)}>
      <Label className="text-sm font-medium mb-3 block">
        {label}
      </Label>
      <TooltipProvider>
        <div className="flex flex-wrap gap-3">
          {areas.map((area) => {
            const isSelected = selectedAreaId === area.idArea;
            const isAreaDisabled = disabled || area.disabled; // Área desabilitada globalmente ou individualmente
            const hasSelection = selectedAreaId !== null;
            const isInactive = isAreaDisabled || (hasSelection && !isSelected);
            const tooltipText = area.disabled ? `Área ${area.nmArea} (já respondida)` : area.nmArea;

            const buttonElement = (
              <button
                key={area.idArea}
                type="button"
                onClick={() => handleAreaClick(area)}
                disabled={isAreaDisabled}
                className={cn(
                  'relative w-[300px] px-4 py-3 rounded-full',
                  'flex items-center gap-3',
                  'bg-gray-50 border border-gray-200',
                  'transition-all duration-200 ease-in-out',
                  'outline-none focus:outline-none',
                  isSelected && 'shadow-sm',
                  isAreaDisabled && 'cursor-not-allowed bg-gray-200 border-gray-300 text-gray-800',
                  !isAreaDisabled && !isInactive && !isSelected && 'hover:bg-gray-100 hover:border-gray-300 cursor-pointer',
                  isSelected && 'hover:bg-gray-50 hover:border-gray-200', // Sem hover azul quando selecionado
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full',
                    'flex items-center justify-center',
                    'border-2 transition-all duration-200',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-transparent border-gray-300',
                    isAreaDisabled && 'border-gray-50 bg-gray-100'
                  )}
                >
                  {isSelected && (
                    <CheckIcon
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
                    isAreaDisabled && 'text-gray-600'
                  )}
                >
                  {area.nmArea}
                </span>
              </button>
            );

            return (
              <Tooltip key={area.idArea}>
                <TooltipTrigger asChild>
                  {buttonElement}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}