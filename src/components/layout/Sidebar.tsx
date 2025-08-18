'use client';

import {cn} from '@/utils/utils';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  BellIcon,
  BuildingIcon,
  ClipboardTextIcon,
  PresentationChartIcon,
  FileTextIcon,
  EnvelopeSimpleIcon,
  UserIcon,
  UsersIcon,
  Icon,
  SignOutIcon,
  ArrowClockwiseIcon, XIcon
} from '@phosphor-icons/react';
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
import {usePathname, useRouter} from 'next/navigation';
import Image from 'next/image';
import {authClient} from '@/api/auth/client';

interface NavigationItem {
  id: string;
  label: string;
  icon: Icon;
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

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "/", label: "Dashboard", icon: PresentationChartIcon },
  { id: "/email", label: "Email", icon: EnvelopeSimpleIcon },
  { id: "/areas", label: "Áreas", icon: BuildingIcon },
  { id: "/temas", label: "Temas", icon: FileTextIcon },
  { id: "/responsaveis", label: "Responsáveis", icon: UsersIcon },
  { id: "/solicitacoes", label: "Solicitações", icon: ClipboardTextIcon },
];

export default function Sidebar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigationItems = NAVIGATION_ITEMS
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authClient.logout();
  };

  const handleNavigation = (id: string) => {
    router.push(id);
  }

  if (pathname !== '/login' && pathname !== '/register') {
    return (
      <div className="flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden w-72">
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
              const isActive = pathname === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex justify-start w-full text-left h-11 text-sm px-4 transition-colors duration-200",
                    isActive && "bg-blue-600 text-white"
                  )}
                  onClick={() => handleNavigation(item.id)}
                >
                  <Icon
                    weight={isActive ? "fill" : "bold"}
                    className="h-4 w-4 flex-shrink-0 mr-3"
                  />
                  <span className="flex-1">{item.label}</span>
                </Button>
              );
            })}

            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <div
                  className="mt-auto"
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Button
                    variant="ghost"
                    className="flex justify-start w-full text-left h-11 text-sm relative px-4"
                  >
                    <BellIcon className="h-4 w-4 flex-shrink-0 mr-3" />
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
                onClick={() => setNotificationsOpen(false)}
              >
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>
                    Notificações
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <XIcon className="h-4 w-4"/>
                  </Button>
                </DropdownMenuLabel>
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
            {/* User Profile Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-start w-full min-h-fit p-6 border-t border-gray-200 rounded-none group"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="w-12 h-12 group-hover:bg-white">
                          JS
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h1 className="w-fit text-md font-bold text-gray-900 overflow-ellipsis">
                          João Silva
                        </h1>
                        <p className="w-fit text-xs text-gray-500 overflow-ellipsis">
                          joao.silva@waybrasil.com
                        </p>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <SignOutIcon className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
