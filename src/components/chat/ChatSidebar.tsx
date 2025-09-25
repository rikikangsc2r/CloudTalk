'use client'
import { LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { ChatList } from './ChatList'
import { NewChatDialog } from './NewChatDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserProfile } from '@/types'

export function ChatSidebar({ userProfile }: { userProfile: UserProfile }) {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  }

  if (!userProfile) return null

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r bg-card/30 h-full">
      <div className="p-4 flex justify-between items-center border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
                <AvatarFallback>
                    <User />
                </AvatarFallback>
              </Avatar>
              <div className='max-w-32 md:max-w-40'>
                <h2 className="text-lg font-headline font-semibold truncate">{userProfile.displayName}</h2>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className='text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer'>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <NewChatDialog />
      </div>

      <ChatList />

    </aside>
  )
}
