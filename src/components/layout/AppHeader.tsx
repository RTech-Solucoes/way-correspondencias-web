"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ProfileButton from "./ProfileButton";
import { User as UserType } from "@/types/auth/types";
import authClient from "@/api/auth/client";
import * as Popover from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import { dashboardClient } from "@/api/dashboard/client";
import { HistoricoRespostaItemDTO } from "@/api/solicitacoes";

interface AppHeaderProps {
  userName?: string;
  userLogin?: string;
  userAvatar?: string;
}

export function AppHeader({
  userName = "Usuário",
  userLogin = "user@email.com",
  userAvatar,
}: AppHeaderProps) {
  const [notifications, setNotifications] = useState<HistoricoRespostaItemDTO[]>([]);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const user: UserType = {
    name: userName,
    username: userLogin,
    email: userLogin,
    avatar: userAvatar || "/images/avatar.svg",
  };

  const handleLogout = () => {
    authClient.logout();
  };

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const count = await dashboardClient.getSolicitacoesPendentesCount();
        setNotificationsCount(count);
        const list = await dashboardClient.getSolicitacoesPendentes();
        setNotifications(list);
      } catch (err) {
        setNotificationsCount(0);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);


  const notificationMessage =
    notificationsCount === 0
      ? "Você não possui novas solicitações."
      : notificationsCount === 1
      ? "Você possui 1 nova solicitação para responder."
      : `Você possui ${notificationsCount} novas solicitações para responder.`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-[82px] px-6">
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-6">
            <ProfileButton user={user} handleLogout={handleLogout} />
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5 text-gray-600" />

                {notificationsCount > 0 && (
                  <span
                    className="absolute top-1 right-1 inline-flex items-center justify-center
                               h-4 w-4 text-[10px] font-bold text-white
                               rounded-full bg-red-500"
                  >
                    {notificationsCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={4}
                className="z-[9999] w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4"
                style={{
                  position: "absolute",
                  right: "10px",
                }}
              >
                {loading ? (
                  <p className="text-sm text-gray-500">Carregando...</p>
                ) : (
                  <p className="text-sm text-gray-700">{notificationMessage}</p>
                )}

                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        
        </div>
      </div>
    </header>
  );
}
