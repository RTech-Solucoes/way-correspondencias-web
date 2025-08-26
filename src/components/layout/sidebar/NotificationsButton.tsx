import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from "react";
import {BellIcon} from "@phosphor-icons/react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {XIcon} from "@phosphor-icons/react";
import {cn} from "@/utils/utils";
import {Notification} from "@/types/notifications/types";

export default function NotificationsButton ({
  unreadCount,
  notifications,
}: {
  unreadCount: number,
  notifications: Notification[],
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex justify-start text-left h-11 mt-auto text-sm relative mx-2 my-3 px-4"
        >
          <BellIcon className="h-4 w-4 flex-shrink-0 mr-3"/>
          <span className="flex-1 text-start">Notificações</span>
          {unreadCount > 0 && (
            <Badge className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full m-4 mb-0"
        align="start"
        onClick={() => setOpen(false)}
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            <XIcon className="h-4 w-4"/>
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0 cursor-pointer">
              <div className={cn(
                "flex flex-col flex-1 items-start justify-between p-4 w-full",
                !notification.unread && "bg-gray-100"
              )}>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                <span className="text-xs text-gray-400">{notification.time}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator/>
        <DropdownMenuItem className="text-center text-primary hover:text-blue-700">
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}