'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import { TemaResponse } from '@/api/temas/types';

interface FiltersState {
  nome: string;
  descricao: string;
}

export interface TemasContextProps {
  temas: TemaResponse[];
  setTemas: Dispatch<SetStateAction<TemaResponse[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedTema: TemaResponse | null;
  setSelectedTema: Dispatch<SetStateAction<TemaResponse | null>>;
  showTemaModal: boolean;
  setShowTemaModal: Dispatch<SetStateAction<boolean>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  temaToDelete: TemaResponse | null;
  setTemaToDelete: Dispatch<SetStateAction<TemaResponse | null>>;
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
  sortField: keyof TemaResponse | null;
  setSortField: Dispatch<SetStateAction<keyof TemaResponse | null>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>;
  handleEdit: (tema: TemaResponse) => void;
  handleDelete: (tema: TemaResponse) => void;
  handleTemaSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
  handleSort: (field: keyof TemaResponse) => void;
}

const TemasContext = createContext<TemasContextProps>({} as TemasContextProps);

export const TemasProvider = ({ children }: { children: ReactNode }) => {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTema, setSelectedTema] = useState<TemaResponse | null>(null);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [temaToDelete, setTemaToDelete] = useState<TemaResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState<keyof TemaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState<FiltersState>({
    nome: '',
    descricao: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const handleEdit = (tema: TemaResponse) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
  };

  const handleDelete = (tema: TemaResponse) => {
    setTemaToDelete(tema);
    setShowDeleteDialog(true);
  };

  const handleTemaSave = () => {
    setShowTemaModal(false);
    setSelectedTema(null);
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      nome: '',
      descricao: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const handleSort = (field: keyof TemaResponse) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  };

  return (
    <TemasContext.Provider
      value={{
        temas,
        setTemas,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        selectedTema,
        setSelectedTema,
        showTemaModal,
        setShowTemaModal,
        showFilterModal,
        setShowFilterModal,
        showDeleteDialog,
        setShowDeleteDialog,
        temaToDelete,
        setTemaToDelete,
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
        handleTemaSave,
        applyFilters,
        clearFilters,
        handleSort,
      }}
    >
      {children}
    </TemasContext.Provider>
  );
};

export const useTemas = () => {
  const context = useContext(TemasContext);
  if (!context) {
    throw new Error('useTemas must be used within a TemasProvider');
  }
  return context;
};
