'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import { AreaResponse } from '@/api/areas/types';

interface FiltersState {
  codigo: string;
  nome: string;
  descricao: string;
  ativo: string;
}

export interface AreasContextProps {
  areas: AreaResponse[];
  setAreas: Dispatch<SetStateAction<AreaResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedArea: AreaResponse | null;
  setSelectedArea: Dispatch<SetStateAction<AreaResponse | null>>;
  showAreaModal: boolean;
  setShowAreaModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  sortField: keyof AreaResponse | null;
  setSortField: Dispatch<SetStateAction<keyof AreaResponse | null>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;
  totalElements: number;
  setTotalElements: Dispatch<SetStateAction<number>>;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  setActiveFilters: Dispatch<SetStateAction<FiltersState>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  areaToDelete: number | null;
  setAreaToDelete: Dispatch<SetStateAction<number | null>>;
  hasActiveFilters: boolean;
  handleSort: (field: keyof AreaResponse) => void;
  handleEdit: (area: AreaResponse) => void;
  handleDelete: (areaId: number) => void;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleSort = (field: keyof AreaResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  };

  const handleEdit = (area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDelete = (areaId: number) => {
    setAreaToDelete(areaId);
    setShowDeleteDialog(true);
  };

  const handleAreaSaved = () => {
    setShowAreaModal(false);
    setSelectedArea(null);
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

  return (
    <AreasContext.Provider
      value={{
        areas,
        setAreas,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        selectedArea,
        setSelectedArea,
        showAreaModal,
        setShowAreaModal,
        showFilterModal,
        setShowFilterModal,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        totalElements,
        setTotalElements,
        filters,
        setFilters,
        activeFilters,
        setActiveFilters,
        showDeleteDialog,
        setShowDeleteDialog,
        areaToDelete,
        setAreaToDelete,
        hasActiveFilters,
        handleSort,
        handleEdit,
        handleDelete,
        handleAreaSaved,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </AreasContext.Provider>
  );
};

export const useAreas = () => {
  const context = useContext(AreasContext);
  if (!context) {
    throw new Error('useAreas must be used within an AreasProvider');
  }
  return context;
};
