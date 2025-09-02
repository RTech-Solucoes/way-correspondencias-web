'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from '@phosphor-icons/react';

export interface FilterItem {
  key: string;
  label: string;
  value: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink';
  onRemove?: () => void;
}

interface FiltrosAplicadosProps {
  filters: FilterItem[];
  showClearAll?: boolean;
  onClearAll?: () => void;
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  green: 'bg-green-100 text-green-800 hover:bg-green-200',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  red: 'bg-red-100 text-red-800 hover:bg-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
};

export function FiltrosAplicados({ 
  filters, 
  showClearAll = true, 
  onClearAll, 
  className = '' 
}: FiltrosAplicadosProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filtros aplicados:</span>
          
          {filters.map((filter) => {
            const colorClass = colorClasses[filter.color || 'blue'];
            
            return (
              <div 
                key={filter.key}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${colorClass}`}
              >
                <span>{filter.label}: &quot;{filter.value}&quot;</span>
                {filter.onRemove && (
                  <button
                    onClick={filter.onRemove}
                    className="rounded p-0.5 transition-colors"
                    title={`Remover filtro ${filter.label}`}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {showClearAll && onClearAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-gray-600 hover:text-gray-800"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Limpar tudo
          </Button>
        )}
      </div>
    </div>
  );
}

export default FiltrosAplicados;
