'use client';
import { useEffect, useRef, useState } from 'react';
import { useJsonBlob } from '@/hooks/useJsonBlob';
import { MessageBubble } from './MessageBubble';
import { Skeleton } from '../ui/skeleton';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

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
  const [isScrolling, setIsScrolling] = useState(false);
  const isMobile = useIsMobile();
  const initialLoadRef = useRef(true);
  
  const chat = data?.chats.find(c => c.id === chatId);
  const messages = chat?.messages?.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];

  useEffect(() => {
    // This effect runs only when the chatId changes, resetting the component for a new chat.
    initialLoadRef.current = true;
    // We show the loading spinner as soon as the chat ID changes and there are messages to be loaded.
    if (messages.length > 0) {
      setIsScrolling(true);
    }
  }, [chatId]); // Depend on chatId to reset state

  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
        const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
            listRef.current?.scrollToItem(messages.length - 1, 'end');
        };

        if (initialLoadRef.current) {
            // This block handles the initial load for a chat.
            // A short delay ensures react-window has rendered before we try to scroll.
            setTimeout(() => {
                scrollToBottom();
                // A second delay removes the overlay *after* the scroll has completed.
                setTimeout(() => {
                    setIsScrolling(false);
                    initialLoadRef.current = false;
                }, 300); // Adjust this timing if needed, allows scroll animation to finish.
            }, 100); 
        } else {
            // This block handles new incoming messages smoothly without an overlay.
            // A short delay ensures the new item is rendered before smooth scrolling.
            setTimeout(() => {
                scrollToBottom('smooth');
            }, 50);
        }
    } else if (messages.length === 0 && isScrolling) {
        // If there are no messages, don't show the spinner.
        setIsScrolling(false);
    }
  }, [messages.length, chatId, isScrolling]); // Rerun when messages appear

  if (loading && !data) {
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
    <div className='flex-1 w-full relative'>
       {isScrolling && (
          <div className="absolute inset-0 bg-background/70 z-10 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
       <AutoSizer>
        {({ height, width }) => (
            <List
                ref={listRef}
                height={height}
                itemCount={messages.length}
                itemSize={index => estimateSize(messages[index])}
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
