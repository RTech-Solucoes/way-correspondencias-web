'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AreaResponse } from '@/api/areas/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { areasClient } from '@/api/areas/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { cn } from '@/utils/utils';
import { CheckIcon } from '@phosphor-icons/react';

interface MultiSelectAreasProps {
  selectedAreaIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  label?: string;
  className?: string;
}

export function MultiSelectAreas({
  selectedAreaIds,
  onSelectionChange,
  label = "Áreas",
  className
}: MultiSelectAreasProps) {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [areasResponse, responsaveisResponse] = await Promise.all([
          areasClient.buscarPorFiltro({ size: 1000 }),
          responsaveisClient.buscarPorFiltro({ size: 1000 })
        ]);

        const areasAtivas = areasResponse.content.filter((area: AreaResponse) => area.flAtivo === 'S');
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
      <Label>{label}</Label>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-gray-500">Buscando áreas...</div>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {areas.map((area, index) => {
            const isChecked = selectedAreaIds.includes(area.idArea);
            return (
              <div
                key={area.idArea}
                className="flex items-center justify-between p-3 bg-gray-50 border box-border rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors min-w-0"
                onClick={() => handleAreaToggle(area.idArea)}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    isChecked 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isChecked && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {area.nmArea}
                  </span>
                </div>
                <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                  {getResponsavelForArea(index)}
                </Badge>
              </div>
            );
          })}
          {areas?.length === 0 && !loading && (
            <div className="text-sm text-gray-500 p-4 text-center col-span-2">
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
