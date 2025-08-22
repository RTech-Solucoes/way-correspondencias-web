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
import { ResponsavelResponse, ResponsavelFilterParams } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface FiltersState {
  usuario: string;
  email: string;
}

export interface ResponsaveisContextProps {
  responsaveis: ResponsavelResponse[];
  loading: boolean;
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
  totalElements: number;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  activeFilters: FiltersState;
  hasActiveFilters: boolean;
  filteredResponsaveis: ResponsavelResponse[];
  loadResponsaveis: () => Promise<void>;
  handleEdit: (responsavel: ResponsavelResponse) => void;
  handleDelete: (responsavel: ResponsavelResponse) => void;
  confirmDelete: () => Promise<void>;
  handleResponsavelSave: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getAreaName: (area: { id: number; nmArea: string; cdArea: string } | undefined) => string;
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

  const [filters, setFilters] = useState<FiltersState>({
    usuario: '',
    email: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    // Only reload if we have data already loaded (not initial load)
    if (responsaveis.length > 0 || activeFilters.usuario || activeFilters.email || debouncedSearchQuery) {
      loadResponsaveis();
    }
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadResponsaveis = async () => {
    try {
      setLoading(true);

      if (activeFilters.usuario && !activeFilters.email && !debouncedSearchQuery) {
        const result = await responsaveisClient.buscarPorNmUsuarioLogin(activeFilters.usuario);
        setResponsaveis([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else if (activeFilters.email && !activeFilters.usuario && !debouncedSearchQuery) {
        const result = await responsaveisClient.buscarPorDsEmail(activeFilters.email);
        setResponsaveis([result]);
        setTotalPages(1);
        setTotalElements(1);
      } else {
        const filterParts = [];
        if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
        if (activeFilters.usuario) filterParts.push(activeFilters.usuario);
        if (activeFilters.email) filterParts.push(activeFilters.email);

        const params: ResponsavelFilterParams = {
          filtro: filterParts.join(' ') || undefined,
          page: currentPage,
          size: 10,
        };
        const response = await responsaveisClient.buscarPorFiltro(params);
        setResponsaveis(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch {
      toast.error("Erro ao carregar responsáveis");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (responsavel: ResponsavelResponse) => {
    setSelectedResponsavel(responsavel);
    setShowResponsavelModal(true);
  };

  const handleDelete = (responsavel: ResponsavelResponse) => {
    setResponsavelToDelete(responsavel);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (responsavelToDelete) {
      try {
        await responsaveisClient.deletar(responsavelToDelete.idResponsavel);
        toast.success("Responsável excluído com sucesso");
        loadResponsaveis();
      } catch {
        toast.error("Erro ao excluir responsável");
      } finally {
        setShowDeleteDialog(false);
        setResponsavelToDelete(null);
      }
    }
  };

  const handleResponsavelSave = () => {
    setShowResponsavelModal(false);
    setSelectedResponsavel(null);
    loadResponsaveis();
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
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  const getAreaName = (area: { id: number; nmArea: string; cdArea: string } | undefined) => {
    return area ? area.nmArea : 'N/A';
  };

  const filteredResponsaveis = responsaveis.filter(responsavel =>
    responsavel.nmResponsavel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.dsEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    responsavel.nmUsuarioLogin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ResponsaveisContext.Provider
      value={{
        responsaveis,
        loading,
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
        totalElements,
        filters,
        setFilters,
        activeFilters,
        hasActiveFilters,
        filteredResponsaveis,
        loadResponsaveis,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleResponsavelSave,
        applyFilters,
        clearFilters,
        getAreaName
      }}
    >
      {children}
    </ResponsaveisContext.Provider>
  );
};

export default function useResponsaveis() {
  const context = useContext(ResponsaveisContext);

  if (!context) {
    throw new Error("useResponsaveis must be used within a ResponsaveisProvider");
  }

  return context;
}
