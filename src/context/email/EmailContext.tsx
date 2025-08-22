'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface EmailFiltersState {
  remetente: string;
  destinatario: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface EmailContextProps {
  selectedEmail: string | null;
  setSelectedEmail: Dispatch<SetStateAction<string | null>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  emailFilters: EmailFiltersState;
  setEmailFilters: Dispatch<SetStateAction<EmailFiltersState>>;
  activeEmailFilters: EmailFiltersState;
  hasActiveFilters: boolean;
  applyFilters: () => void;
  clearFilters: () => void;
}

const EmailContext = createContext<EmailContextProps>({} as EmailContextProps);

export const EmailProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [emailFilters, setEmailFilters] = useState<EmailFiltersState>({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [activeEmailFilters, setActiveEmailFilters] = useState<EmailFiltersState>({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const applyFilters = () => {
    setActiveEmailFilters(emailFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      remetente: '',
      destinatario: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setEmailFilters(clearedFilters);
    setActiveEmailFilters(clearedFilters);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeEmailFilters).some(value => value !== '');

  return (
    <EmailContext.Provider
      value={{
        selectedEmail,
        setSelectedEmail,
        searchQuery,
        setSearchQuery,
        showFilterModal,
        setShowFilterModal,
        emailFilters,
        setEmailFilters,
        activeEmailFilters,
        hasActiveFilters,
        applyFilters,
        clearFilters
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export default function useEmail() {
  const context = useContext(EmailContext);

  if (!context) {
    throw new Error("useEmail must be used within a EmailProvider");
  }

  return context;
}
