'use client';

import {useEffect, useState} from 'react';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {AreaResponse} from '@/api/areas/types';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import {areasClient} from '@/api/areas/client';
import {responsaveisClient} from '@/api/responsaveis/client';
import {cn} from '@/utils/utils';
import {CheckIcon} from '@phosphor-icons/react';

interface MultiSelectAreasProps {
  selectedAreaIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectAreas({
  selectedAreaIds,
  onSelectionChange,
  label = "Áreas",
  className,
  disabled
}: MultiSelectAreasProps) {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [areaResponse, responsaveisResponse] = await Promise.all([
          areasClient.buscarPorFiltro({ size: 1000 }),
          responsaveisClient.buscarPorFiltro({ size: 1000 })
        ]);

        const areasAtivas = areaResponse.content.filter((area: AreaResponse) => area.flAtivo === 'S');
        const responsaveisAtivos = responsaveisResponse.content.filter((resp: ResponsavelResponse) => resp.flAtivo === 'S');

        setAreas(areasAtivas);
        setResponsaveis(responsaveisAtivos);
      } catch {
        setAreas([]);
        setResponsaveis([]);
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
      onSelectionChange([...selectedAreaIds, areaId]);
    }
  };

  const getResponsavelForArea = (areaIndex: number) => {
    if (responsaveis.length === 0) return 'N/A';

    const responsavelIndex = areaIndex % responsaveis.length;
    return responsaveis[responsavelIndex]?.nmResponsavel || 'N/A';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label
        className={cn(disabled && 'opacity-50')}
      >{label}</Label>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-gray-500">Buscando áreas...</div>
        </div>
      ) : (
        <div className={cn("mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto", disabled && "opacity-50 pointer-events-none")}>
          {areas.map((area, index) => {
            const isChecked = selectedAreaIds.includes(area.idArea);
            return (
              <div
                key={area.idArea}
                className={cn(
                  "flex flex-row items-start gap-2 justify-between p-3 bg-gray-100 box-border rounded-3xl transition-colors min-w-0",
                  disabled ? "cursor-not-allowed bg-gray-100" : "cursor-pointer hover:bg-gray-100"
                )}
                onClick={() => handleAreaToggle(area.idArea)}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    isChecked 
                      ? 'bg-blue-500 border-blue-500' 
                      : disabled 
                        ? 'border-gray-200' 
                        : 'border-gray-300'
                  }`}>
                    {isChecked && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    disabled ? "text-gray-400" : "text-gray-700"
                  )}>
                    {area.nmArea}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 flex-shrink-0 text-xs border-none text-foreground bg-gray-200",
                    disabled && "opacity-60"
                  )}
                >
                  {getResponsavelForArea(index)}
                </Badge>
              </div>
            );
          })}
          {areas?.length === 0 && !loading && (
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
