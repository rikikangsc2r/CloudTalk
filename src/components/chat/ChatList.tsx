'use client'

import { collection, query, where, orderBy, doc } from 'firebase/firestore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNowStrict } from 'date-fns'
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase'
import type { Chat, UserProfile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useEffect, useMemo } from 'react'


function ChatListItem({ chat }: { chat: Chat }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const otherUserId = useMemo(() => {
    return chat.users.find(uid => uid !== user?.uid)
  }, [chat.users, user]);

  const otherUserRef = useMemoFirebase(() => {
    if (!firestore || !otherUserId) return null;
    return doc(firestore, 'users', otherUserId)
  }, [firestore, otherUserId]);

  const { data: otherUser } = useDoc<UserProfile>(otherUserRef);

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
            {chat.lastMessage?.timestamp && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNowStrict(chat.lastMessage.timestamp.toDate())}
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
  const { user } = useUser()
  const firestore = useFirestore()

  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'chats'), 
        where('users', 'array-contains', user.uid),
        orderBy('lastMessage.timestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  if (isLoading) {
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

  if (chats && chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <nav className="p-2 space-y-1">
        {chats?.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </nav>
    </ScrollArea>
  )
}
