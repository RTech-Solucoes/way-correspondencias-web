'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {FileText, Kanban, Mail, Plus, Settings, Users, BarChart} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import EmailClient from '@/components/email/EmailClient';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import DocumentsList from '@/components/documents/DocumentsList';
import Sidebar from '@/components/layout/Sidebar';
import ApiTestComponent from '@/api/ApiTestComponent';
import Dashboard from '@/components/dashboard/Dashboard';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart, count: 0 },
  { id: 'email', label: 'Email', icon: Mail, count: 12 },
  { id: 'kanban', label: 'Obrigações Contratuais', icon: Kanban, count: 8 },
  { id: 'documents', label: 'Documentos', icon: FileText, count: 15 },
  { id: 'team', label: 'Equipe', icon: Users, count: 0 },
  { id: 'settings', label: 'Configurações', icon: Settings, count: 0 },
];

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ nm_responsavel: string; email: string; } | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check authentication status
    const authStatus = localStorage.getItem('user');
    if (authStatus) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(authStatus);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router, mounted]);

  const [activeModule, setActiveModule] = useState<'dashboard' | 'email' | 'kanban' | 'documents' | 'api-test' | 'team' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'email':
        return <EmailClient />;
      case 'kanban':
        return <KanbanBoard />;
      case 'documents':
        return <DocumentsList />;
      case 'api-test':
        return <ApiTestComponent />;
      case 'team':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-8 w-8 mr-3" />
                Gerenciamento de Equipe
              </h1>
              <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Módulo de Equipe</h3>
                <p className="text-gray-600 mb-4">Gerencie membros da equipe, funções e permissões</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro da Equipe
                </Button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-8 w-8 mr-3" />
                Configurações
              </h1>
              <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurações da Aplicação</h3>
                <p className="text-gray-600 mb-4">Configure suas preferências da aplicação</p>
                <Button variant="secondary">Configurar</Button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main
        className={cn(
          "flex flex-row min-w-0 transition-all duration-300 ease-in-out max-h-screen",
          "w-full h-full",
        )}
      >
        <Sidebar
          navigationItems={NAVIGATION_ITEMS}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        <div className="flex flex-col w-full overflow-auto min-h-screen">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
}