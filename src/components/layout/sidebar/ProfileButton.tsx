import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {SignOutIcon} from "@phosphor-icons/react";
import {User} from "@/types/auth/types";
import {getFirstAndLastName, getInitials} from "@/utils/utils";



export default function ProfileButton ({
  user,
  handleLogout
} : {
  user: User,
  handleLogout(): void
}) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full min-h-fit p-6 border-t border-gray-200 rounded-none group"
        >
          <div className="flex items-center justify-start space-x-3 w-full min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="w-12 h-12 group-hover:bg-white">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 overflow-hidden text-start">
              <h1 className="text-md font-bold text-gray-900 truncate">
                {getFirstAndLastName(user?.name)}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {user?.username}
              </p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full m-4 mb-0"
        align="start"
      >
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
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
  )
}