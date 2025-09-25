'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNowStrict } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useJsonBlob } from '@/hooks/useJsonBlob'
import type { Chat, UserProfile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

function ChatListItem({ chat, allUsers }: { chat: Chat, allUsers: UserProfile[] }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const otherUserId = chat.users.find(uid => uid !== user?.uid);
  const otherUser = allUsers.find(u => u.uid === otherUserId);
  const lastMessageTimestamp = chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp) : null;

  return (
      <Link
        href={`/chat/${chat.id}`}
        className={cn(
            "flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors",
            pathname === `/chat/${chat.id}` && 'bg-accent'
        )}
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherUser?.photoURL} alt={otherUser?.displayName} />
          <AvatarFallback>{otherUser?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold truncate">{otherUser?.displayName ?? 'Unknown User'}</h3>
            {lastMessageTimestamp && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNowStrict(lastMessageTimestamp)}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {chat.lastMessage?.text ?? (chat.lastMessage?.imageUrl ? 'Image' : 'No messages yet')}
          </p>
        </div>
      </Link>
  )
}

export function ChatList() {
  const { user } = useAuth()
  const { data, loading } = useJsonBlob()

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  const userChats = data?.chats
    .filter(chat => chat.users.includes(user?.uid ?? ''))
    .sort((a,b) => {
        const dateA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const dateB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return dateB - dateA;
    });


  if (!userChats || userChats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <nav className="p-2 space-y-1">
        {userChats.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} allUsers={data?.users ?? []} />
        ))}
      </nav>
    </ScrollArea>
  )
}
