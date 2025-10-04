import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {SignOutIcon, UserIcon} from "@phosphor-icons/react";
import {User} from "@/types/auth/types";
import {getFirstAndLastName, getInitials} from "@/utils/utils";
import ProfileModal from "./ProfileModal";
import { useState } from 'react';

export default function ProfileButton ({
  user,
  handleLogout
} : {
  user: User | null,
  handleLogout(): void
}) {

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{getFirstAndLastName(user?.name)}</div>
                <div className="text-xs text-gray-500">{user?.perfil}</div>
              </div>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={user?.avatar || '/images/avatar.svg'}
                  alt="Avatar do usuário"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
                />
                <AvatarFallback className="w-8 h-8">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            sideOffset={5}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Minha Conta</span>
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

        <ProfileModal
          user={user}
          open={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </>
    )
  }
}
