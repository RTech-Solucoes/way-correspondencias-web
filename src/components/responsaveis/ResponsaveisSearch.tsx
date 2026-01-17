import { FunnelSimpleIcon, MagnifyingGlassIcon, XIcon, PlusIcon } from '@phosphor-icons/react';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResponsaveisSearchProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  canInserirResponsavel?: boolean | null;
  onCriarResponsavel?: () => void;
}

export default function ResponsaveisSearch({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  clearFilters,
  setShowFilterModal,
  canInserirResponsavel,
  onCriarResponsavel,
}: ResponsaveisSearchProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Pesquisar responsáveis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="h-10 px-4"
          onClick={clearFilters}
        >
          <XIcon className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
      <Button
        variant="secondary"
        className="h-10 px-4"
        onClick={() => setShowFilterModal(true)}
      >
        <FunnelSimpleIcon className="h-4 w-4 mr-2" />
        Filtrar
      </Button>
      {canInserirResponsavel && (
        <Button
          className="h-10 px-4"
          onClick={onCriarResponsavel}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Criar Responsável
        </Button>
      )}
    </div>
  );
}
