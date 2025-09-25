'use client';
import { useEffect, useRef } from 'react';
import { useJsonBlob } from '@/hooks/useJsonBlob';
import { MessageBubble } from './MessageBubble';
import { Skeleton } from '../ui/skeleton';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useIsMobile } from '@/hooks/use-mobile';


const Row = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any[] }) => {
    const message = data[index];
    return (
        <div style={style} className='px-4 flex flex-col justify-end'>
            <div className='pb-1'>
              <MessageBubble message={message} />
            </div>
        </div>
    );
};


export function MessageList({ chatId }: { chatId: string }) {
  const { data, loading } = useJsonBlob();
  const listRef = useRef<List>(null);
  const isMobile = useIsMobile();
  
  const chat = data?.chats.find(c => c.id === chatId);
  const messages = chat?.messages?.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];

  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
        // A short timeout ensures the list has rendered before we scroll.
        setTimeout(() => {
            listRef.current?.scrollToItem(messages.length - 1, 'end');
        }, 50);
    }
  }, [messages.length, chatId, loading]);

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
  
  const estimateSize = (message: any) => {
    const baseHeight = 40; // base height for a simple text message
    const textHeight = message.text ? Math.ceil(message.text.length / (isMobile ? 30 : 50)) * 20 : 0;
    const imageHeight = message.imageUrl ? 220 : 0;
    return baseHeight + textHeight + imageHeight;
  }

  if (messages.length === 0) {
      return (
          <div className='flex-1 flex items-center justify-center'>
            <p className='text-muted-foreground'>Send a message to start the conversation.</p>
          </div>
      )
  }

  return (
    <div className='flex-1 w-full'>
       <AutoSizer>
        {({ height, width }) => (
            <List
                ref={listRef}
                height={height}
                itemCount={messages.length}
                itemSize={index => estimateSize(messages[index])} // Dynamic item size
                width={width}
                itemData={messages}
            >
                {Row}
            </List>
        )}
      </AutoSizer>
    </div>
  );
}
