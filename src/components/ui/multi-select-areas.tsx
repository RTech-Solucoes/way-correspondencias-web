'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import { Label } from '@/components/ui/label';
import { AreaResponse } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';
import { cn } from '@/utils/utils';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        const response = await areasClient.buscarPorFiltro({ size: 1000 });
        const areasAtivas = response.content.filter((area: AreaResponse) => area.flAtivo === 'S');
        setAreas(areasAtivas);
      } catch {
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const handleAreaToggle = (areaId: number) => {
    const isSelected = selectedAreaIds.includes(areaId);

    if (isSelected) {
      onSelectionChange(selectedAreaIds.filter(id => id !== areaId));
    } else {
      onSelectionChange([...selectedAreaIds, areaId]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label>{label}</Label>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-gray-500">Buscando áreas...</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {areas.map((area) => (
            <button
              key={area.idArea}
              type="button"
              onClick={() => handleAreaToggle(area.idArea)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-sm",
                selectedAreaIds.includes(area.idArea)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                selectedAreaIds.includes(area.idArea)
                  ? "border-white bg-white"
                  : "border-gray-400 bg-transparent"
              )}>
                {selectedAreaIds.includes(area.idArea) && (
                  <CheckIcon className="w-2.5 h-2.5 text-blue-500"/>
                )}
              </div>
              {area.nmArea}
            </button>
          ))}
          {areas.length === 0 && !loading && (
            <div className="text-sm text-gray-500 pt-4">
              Nenhuma área encontrada
            </div>
          )}
        </div>
      )}
      {selectedAreaIds.length > 0 && (
        <div className="text-xs text-gray-500">
          {selectedAreaIds.length} área(s) selecionada(s)
        </div>
      )}
    </div>
  );
}
