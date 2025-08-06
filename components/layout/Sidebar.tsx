'use client';

import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Bell, LucideIcon, User} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useState} from "react";
import {useRouter} from 'next/navigation';
import Image from 'next/image';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  activeModule: string;
  onModuleChange(module: any): void;
  user?: {
    nm_responsavel: string;
    email: string;
  };
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Novo email recebido',
    message: 'Maria Silva enviou um relatório de compliance',
    time: '5 min atrás',
    unread: true,
  },
  {
    id: '2',
    title: 'Tarefa atualizada',
    message: 'João atualizou a tarefa "Implementar autenticação JWT"',
    time: '15 min atrás',
    unread: true,
  },
  {
    id: '3',
    title: 'Documento aprovado',
    message: 'Processo de compliance foi aprovado',
    time: '1 hora atrás',
    unread: false,
  },
];

export default function Sidebar({
  navigationItems,
  activeModule,
  onModuleChange,
  user
}: SidebarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    router.push('/login');
  };

  return (
    <div className="flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden w-[20rem]">
      <div className="flex flex-col h-full">
        <div className="flex justify-start gap-3 p-6 border-b border-gray-200">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={400}
            height={221}
            className="h-11 w-auto"
          />
          <div className="items-start whitespace-nowrap">
            <h1 className="w-fit text-xl font-bold text-gray-900">Way 262</h1>
            <p className="w-fit text-xs text-gray-500">Software Regulatório</p>
          </div>
        </div>

        <nav className="flex flex-col grow gap-3 px-2 py-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "flex justify-start w-full text-left h-11 text-sm px-4",
                  isActive && "bg-blue-600 text-white"
                )}
                onClick={() => onModuleChange(item.id)}
              >
                <Icon className="h-4 w-4 flex-shrink-0 mr-3" />
                <span className="flex-1">{item.label}</span>
                {item.count > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className={cn(
                      "ml-auto",
                      isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className="mt-auto"
                onMouseEnter={() => setNotificationsOpen(true)}
                onMouseLeave={() => setNotificationsOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="flex justify-start w-full text-left h-11 text-sm relative px-4"
                >
                  <Bell className="h-4 w-4 flex-shrink-0 mr-3" />
                  <span className="flex-1 text-start">Notificações</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-full m-4 mb-0"
              align="end"
              onMouseEnter={() => setNotificationsOpen(true)}
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 cursor-pointer">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex-col justify-end space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-start w-full min-h-fit p-6 border-t border-gray-200 rounded-none group"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profile Picture"/>
                      <AvatarFallback className="w-12 h-12 group-hover:bg-white">JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="w-fit text-md font-bold text-gray-900">{user?.nm_responsavel || "João Silva"}</h1>
                      <p className="w-fit text-xs text-gray-500">{user?.email || "joao.silva@waybrasil.com"}</p>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 mx-4" align="center" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nm_responsavel || "João Silva"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "john.doe@waybrasil.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                Suporte
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
