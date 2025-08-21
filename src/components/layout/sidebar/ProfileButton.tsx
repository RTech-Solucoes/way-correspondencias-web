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



export default function ProfileButton ({
  user,
  handleLogout
} : {
  user: User,
  handleLogout(): void
}) {
  const names = user?.name.split(' ')
  const nameInital = names?.[0]?.charAt(0).toUpperCase()
  const surnameInital = names?.[names.length - 1]?.charAt(0).toUpperCase()
  const initials = nameInital + surnameInital

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full min-h-fit p-6 border-t border-gray-200 rounded-none group"
        >
          <div className="flex items-center justify-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="w-12 h-12 group-hover:bg-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="w-fit text-md font-bold text-gray-900 overflow-ellipsis">
                {user?.name}
              </h1>
              <p className="w-fit text-xs text-gray-500 overflow-ellipsis">
                {user?.email}
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