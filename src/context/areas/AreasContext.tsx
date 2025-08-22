'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";
import { AreaResponse, AreaRequest } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  codigo: string;
  nome: string;
  descricao: string;
  ativo: string;
}

export interface AreasContextProps {
  areas: AreaResponse[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedArea: AreaResponse | null;
  setSelectedArea: Dispatch<SetStateAction<AreaResponse | null>>;
  showAreaModal: boolean;
  setShowAreaModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  sortField: keyof AreaResponse | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  totalElements: number;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  areaToDelete: number | null;
  setAreaToDelete: Dispatch<SetStateAction<number | null>>;
  hasActiveFilters: boolean;
  loadAreas: () => Promise<void>;
  handleSort: (field: keyof AreaResponse) => void;
  handleEdit: (area: AreaResponse) => void;
  handleDelete: (areaId: number) => Promise<void>;
  confirmDelete: () => Promise<void>;
  handleAreaSave: (area: AreaRequest) => Promise<void>;
  handleAreaSaved: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

const AreasContext = createContext<AreasContextProps>({} as AreasContextProps);

export const AreasProvider = ({ children }: { children: ReactNode }) => {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<AreaResponse | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof AreaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<FiltersState>({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    // Only reload if we have data already loaded (not initial load)
    if (areas.length > 0 || activeFilters.codigo || activeFilters.nome || activeFilters.descricao || debouncedSearchQuery) {
      loadAreas();
    }
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadAreas = async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.codigo) filterParts.push(activeFilters.codigo);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);
      if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

      const filtro = filterParts.join(' ');

      const response = await areasClient.buscarPorFiltro({
        filtro: filtro || undefined,
        page: currentPage,
        size: 10,
        sort: sortField ? `${sortField},${sortDirection}` : undefined
      });

      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof AreaResponse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleEdit = (area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDelete = async (areaId: number) => {
    setAreaToDelete(areaId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        await areasClient.deletar(areaToDelete);
        toast.success("Área excluída com sucesso");
        loadAreas();
      } catch (error) {
        toast.error("Erro ao excluir área");
      } finally {
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  const handleAreaSave = async (area: AreaRequest) => {
    try {
      if (selectedArea) {
        await areasClient.atualizar(selectedArea.idArea, area);
        toast.success("Área atualizada com sucesso");
      } else {
        await areasClient.criar(area);
        toast.success("Área criada com sucesso");
      }
      setShowAreaModal(false);
      setSelectedArea(null);
      loadAreas();
    } catch (error) {
      toast.error("Erro ao salvar área");
    }
  };

  const handleAreaSaved = () => {
    setShowAreaModal(false);
    setSelectedArea(null);
    loadAreas();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      codigo: '',
      nome: '',
      descricao: '',
      ativo: ''
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <AreasContext.Provider
      value={{
        areas,
        loading,
        searchQuery,
        setSearchQuery,
        selectedArea,
        setSelectedArea,
        showAreaModal,
        setShowAreaModal,
        showFilterModal,
        setShowFilterModal,
        sortField,
        sortDirection,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        filters,
        setFilters,
        activeFilters,
        showDeleteDialog,
        setShowDeleteDialog,
        areaToDelete,
        setAreaToDelete,
        hasActiveFilters,
        loadAreas,
        handleSort,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleAreaSave,
        handleAreaSaved,
        applyFilters,
        clearFilters
      }}
    >
      {children}
    </AreasContext.Provider>
  );
};

export default function useAreas() {
  const context = useContext(AreasContext);

  if (!context) {
    throw new Error("useAreas must be used within a AreasProvider");
  }

  return context;
}
