'use client';

import {usePathname} from 'next/navigation';
import Header from './Header';
import ProfileButton from './ProfileButton';
import Nav from './Nav';
import {PAGES_DEF} from '@/constants/pages';
import {User} from "@/types/auth/types";
import NotificationsButton from "./NotificationsButton";
import authClient from "@/api/auth/client";
import {Notification} from "@/types/notifications/types";

const MOCK_USER: User = {
  name: "Joao da Silva Nunes",
  email: "joaonunes@email.com",
  avatar: "/images/avatar.png"
}

const MOCK_NOTIFICATIONS: Notification[] = [
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

export default function Sidebar() {
  const user = MOCK_USER;
  const notifications = MOCK_NOTIFICATIONS;
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const pathname = usePathname();

  const handleLogout = () => {
    authClient.logout();
  };

  if (pathname !== '/') {
    return (
      <div className="flex flex-col min-h-full flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden w-72">
        <Header
          logoSrc="/images/logo.png"
          title="Way 262"
          subtitle="Software Regulatório"
        />

        <Nav
          navigationItems={PAGES_DEF}
          pathname={pathname}
        />

        <NotificationsButton
          unreadCount={unreadCount}
          notifications={notifications}
        />

        <ProfileButton
          user={user}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  return null;
}
