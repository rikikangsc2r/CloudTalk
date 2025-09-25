'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useJsonBlob } from '@/hooks/useJsonBlob'
import type { UserProfile, Chat } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'


export function NewChatDialog() {
  const { user } = useAuth()
  const { data, loading, updateData } = useJsonBlob();
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const recentlyActiveUsers = useMemo(() => {
    if (!data || !data.chats || !data.users) return [];

    const lastActivity: { [userId: string]: number } = {};

    data.chats.forEach(chat => {
      if (chat.lastMessage?.timestamp) {
        const timestamp = new Date(chat.lastMessage.timestamp).getTime();
        chat.users.forEach(userId => {
          if (userId !== user?.uid) {
            if (!lastActivity[userId] || timestamp > lastActivity[userId]) {
              lastActivity[userId] = timestamp;
            }
          }
        });
      }
    });

    const sortedUserIds = Object.keys(lastActivity).sort((a, b) => lastActivity[b] - lastActivity[a]);
    
    const activeUsers = sortedUserIds
      .map(userId => data.users.find(u => u.uid === userId))
      .filter((u): u is UserProfile => !!u);
      
    // Add other users who might not have activity yet
    const otherUsers = data.users.filter(u => u.uid !== user?.uid && !lastActivity[u.uid]);

    return [...activeUsers, ...otherUsers].slice(0, 10);
  }, [data, user]);


  const handleCreateChat = async (otherUser: UserProfile) => {
    if (!user || !data) return
    
    const existingChat = data.chats.find(chat => 
      chat.users.length === 2 && chat.users.includes(user.uid) && chat.users.includes(otherUser.uid)
    );
    
    try {
        if (existingChat) {
            router.push(`/chat/${existingChat.id}`);
        } else {
            const newChat: Chat = {
                id: Date.now().toString(),
                users: [user.uid, otherUser.uid],
                messages: [],
                createdAt: new Date().toISOString(),
                unreadCounts: { [user.uid]: 0, [otherUser.uid]: 0 },
            };
            const updatedData = { ...data, chats: [...data.chats, newChat] };
            await updateData(updatedData);
            router.push(`/chat/${newChat.id}`);
        }
        setOpen(false)
    } catch (error) {
        console.error("Error creating or finding chat:", error)
        toast({ title: 'Error', description: 'Could not start a new chat.' })
    }
  }

  const filteredUsers = recentlyActiveUsers.filter(u =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquarePlus />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <Input 
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-72">
          <div className="p-4 space-y-4">
            {loading ? <p>Loading users...</p> : 
              filteredUsers.map(u => (
                <div key={u.uid} onClick={() => handleCreateChat(u)} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-accent rounded-lg">
                  <Avatar>
                    <AvatarImage src={u.photoURL} alt={u.displayName} />
                    <AvatarFallback><User/></AvatarFallback>
                  </Avatar>
                  <p>{u.displayName}</p>
                </div>
            ))}
            {!loading && filteredUsers.length === 0 && (
                <p className='text-center text-sm text-muted-foreground'>No users found.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
