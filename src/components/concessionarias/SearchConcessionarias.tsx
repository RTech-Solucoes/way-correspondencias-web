'use client';

import { Dispatch, SetStateAction } from 'react';
import { FunnelSimpleIcon, MagnifyingGlassIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchConcessionariasProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  canInserirConcessionaria?: boolean | null;
  onCriarConcessionaria?: () => void;
  onFilter?: () => void;
}

export default function SearchConcessionarias({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  clearFilters,
  canInserirConcessionaria,
  onCriarConcessionaria,
  onFilter,
}: SearchConcessionariasProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Pesquisar por código, nome ou descrição"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="h-10 px-4" onClick={clearFilters}>
          <XIcon className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      )}

      <Button
        variant="secondary"
        className="h-10 px-4"
        onClick={onFilter}
      >
        <FunnelSimpleIcon className="h-4 w-4 mr-2" />
        Filtrar
      </Button>

      {canInserirConcessionaria && (
        <Button
          className="h-10 px-4"
          onClick={onCriarConcessionaria}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Criar Concessionária
        </Button>
      )}
    </div>
  );
}
