'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from "react";
import { TemaResponse } from '@/api/temas/types';
import { temasClient } from '@/api/temas/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  nome: string;
  descricao: string;
}

export interface TemasContextProps {
  temas: TemaResponse[];
  loading: boolean;
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
  totalElements: number;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  hasActiveFilters: boolean;
  loadTemas: () => Promise<void>;
  handleEdit: (tema: TemaResponse) => void;
  handleDelete: (tema: TemaResponse) => void;
  confirmDelete: () => Promise<void>;
  handleTemaSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
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

  const [filters, setFilters] = useState<FiltersState>({
    nome: '',
    descricao: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadTemas = useCallback(async () => {
    try {
      setLoading(true);

      if (activeFilters.nome && !activeFilters.descricao && !debouncedSearchQuery) {
        const result = await temasClient.buscarPorNmTema(activeFilters.nome);
        setTemas([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.nome) filterParts.push(activeFilters.nome);
        if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

        const response = await temasClient.buscarPorFiltroComAreas({
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 50,
        });

        setTemas(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch {
      toast.error("Erro ao carregar temas");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  const handleEdit = (tema: TemaResponse) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
  };

  const handleDelete = (tema: TemaResponse) => {
    setTemaToDelete(tema);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (temaToDelete) {
      try {
        await temasClient.deletar(temaToDelete.idTema);
        toast.success("Tema excluído com sucesso");
        loadTemas();
      } catch {
        toast.error("Erro ao excluir tema");
      } finally {
        setShowDeleteDialog(false);
        setTemaToDelete(null);
      }
    }
  };

  const handleTemaSave = () => {
    setShowTemaModal(false);
    setSelectedTema(null);
    loadTemas();
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

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <TemasContext.Provider
      value={{
        temas,
        loading,
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
        totalElements,
        filters,
        setFilters,
        activeFilters,
        hasActiveFilters,
        loadTemas,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleTemaSave,
        applyFilters,
        clearFilters
      }}
    >
      {children}
    </TemasContext.Provider>
  );
};

export default function useTemas() {
  const context = useContext(TemasContext);

  if (!context) {
    throw new Error("useTemas must be used within a TemasProvider");
  }

  return context;
}
