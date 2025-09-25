'use client'
import { useEffect, useRef } from 'react'
import { collection, query, orderBy } from 'firebase/firestore'
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import type { Message } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { Skeleton } from '../ui/skeleton'

export function MessageList({ chatId }: { chatId: string }) {
  const firestore = useFirestore();
  const viewportRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
  }, [firestore, chatId]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (isLoading) {
    return (
        <div className="flex-1 p-4 space-y-4">
             <Skeleton className="h-10 w-3/4 rounded-lg" />
             <Skeleton className="h-10 w-1/2 rounded-lg ml-auto" />
             <Skeleton className="h-16 w-2/3 rounded-lg" />
             <Skeleton className="h-10 w-3/4 rounded-lg ml-auto" />
        </div>
    )
  }

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
      <div className="p-4 space-y-4">
        {messages && messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {(!messages || messages.length === 0) && !isLoading && (
          <div className='flex items-center justify-center h-full'>
            <p className='text-muted-foreground'>Send a message to start the conversation.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
