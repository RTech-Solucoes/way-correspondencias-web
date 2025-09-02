'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import { ResponsavelResponse } from '@/api/responsaveis/types';

interface FiltersState {
  usuario: string;
  email: string;
}

export interface ResponsaveisContextProps {
  responsaveis: ResponsavelResponse[];
  setResponsaveis: Dispatch<SetStateAction<ResponsavelResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedResponsavel: ResponsavelResponse | null;
  setSelectedResponsavel: Dispatch<SetStateAction<ResponsavelResponse | null>>;
  showResponsavelModal: boolean;
  setShowResponsavelModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  responsavelToDelete: ResponsavelResponse | null;
  setResponsavelToDelete: Dispatch<SetStateAction<ResponsavelResponse | null>>;
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
  hasActiveFilters: boolean;
  sortField: keyof ResponsavelResponse | null;
  setSortField: Dispatch<SetStateAction<keyof ResponsavelResponse | null>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>;
  handleEdit: (responsavel: ResponsavelResponse) => void;
  handleDelete: (responsavel: ResponsavelResponse) => void;
  handleResponsavelSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getAreaName: (area: { id: number; nmArea: string; cdArea: string } | undefined) => string;
  handleSort: (field: keyof ResponsavelResponse) => void;
}

const ResponsaveisContext = createContext<ResponsaveisContextProps>({} as ResponsaveisContextProps);

export const ResponsaveisProvider = ({ children }: { children: ReactNode }) => {
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelResponse | null>(null);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<ResponsavelResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState<keyof ResponsavelResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState<FiltersState>({
    usuario: '',
    email: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleEdit = (responsavel: ResponsavelResponse) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  };

  const handleDelete = (responsavel: ResponsavelResponse) => {
    setResponsavelToDelete(responsavel);
    setShowDeleteDialog(true);
  };

  const handleResponsavelSave = () => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      usuario: '',
      email: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setSearchQuery('');
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const getAreaName = (area: { id: number; nmArea: string; cdArea: string } | undefined) => {
    return area?.nmArea || 'N/A';
  };

  const handleSort = (field: keyof ResponsavelResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  };

  return (
    <ResponsaveisContext.Provider
      value={{
        responsaveis,
        setResponsaveis,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        selectedResponsavel,
        setSelectedResponsavel,
        showResponsavelModal,
        setShowResponsavelModal,
        showFilterModal,
        setShowFilterModal,
        showDeleteDialog,
        setShowDeleteDialog,
        responsavelToDelete,
        setResponsavelToDelete,
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
        hasActiveFilters,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        handleEdit,
        handleDelete,
        handleResponsavelSave,
        applyFilters,
        clearFilters,
        getAreaName,
        handleSort,
      }}
    >
      {children}
    </ResponsaveisContext.Provider>
  );
};

export const useResponsaveis = () => {
  const context = useContext(ResponsaveisContext);
  if (!context) {
    throw new Error('useResponsaveis must be used within a ResponsaveisProvider');
  }
  return context;
};
