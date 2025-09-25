'use client'
import { useEffect, useRef } from 'react'
import { useJsonBlob } from '@/hooks/useJsonBlob'
import type { Message } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { Skeleton } from '../ui/skeleton'

export function MessageList({ chatId }: { chatId: string }) {
  const { data, loading } = useJsonBlob();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const chat = data?.chats.find(c => c.id === chatId);
  const messages = chat?.messages?.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (loading) {
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
    <ScrollArea className="flex-1" ref={viewportRef}>
      <div className="p-4 space-y-4">
        {messages && messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {(!messages || messages.length === 0) && !loading && (
          <div className='flex items-center justify-center h-full'>
            <p className='text-muted-foreground'>Send a message to start the conversation.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
