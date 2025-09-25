'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNowStrict } from 'date-fns'
import { firestore } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import type { Chat, UserProfile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const q = query(collection(firestore, 'chats'), where('users', 'array-contains', user.uid))
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData: Chat[] = await Promise.all(
        querySnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data()
          const otherUserId = chatData.users.find((uid: string) => uid !== user.uid)
          
          let otherUser: UserProfile | undefined = undefined
          if (otherUserId) {
            const userSnap = await getDoc(doc(firestore, 'users', otherUserId))
            if (userSnap.exists()) {
              otherUser = userSnap.data() as UserProfile
            }
          }

          // Get last message
          const messagesQuery = query(collection(firestore, `chats/${chatDoc.id}/messages`), orderBy('timestamp', 'desc'), where('timestamp', '!=', null));
          let lastMessage: any = null;
          
          return {
            id: chatDoc.id,
            ...chatData,
            otherUser,
            lastMessage: chatData.lastMessage // Use lastMessage field from chat doc
          } as Chat
        })
      )
      
      // Sort chats by last message timestamp
      chatsData.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timeB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      setChats(chatsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

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

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <nav className="p-2 space-y-1">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors",
                pathname === `/chat/${chat.id}` && 'bg-accent'
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.otherUser?.photoURL} alt={chat.otherUser?.displayName} />
              <AvatarFallback>{chat.otherUser?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold truncate">{chat.otherUser?.displayName ?? 'Unknown User'}</h3>
                {chat.lastMessage?.timestamp && (
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNowStrict(chat.lastMessage.timestamp.toDate())}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastMessage?.text ?? chat.lastMessage?.imageUrl ? 'Image' : 'No messages yet'}
              </p>
            </div>
          </Link>
        ))}
      </nav>
    </ScrollArea>
  )
}
