'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const params = useParams();
  const hasActiveChat = !!params.chatId;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden md:flex flex-col gap-4 p-4 border-r w-80 lg:w-96 bg-card/50">
          <div className='flex items-center gap-3 p-4 border-b'>
             <Skeleton className="h-10 w-10 rounded-full" />
             <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="flex-1 p-4 hidden md:block">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 p-4 md:hidden">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-dvh w-full bg-background">
        {hasActiveChat ? <main className="flex-1 flex flex-col h-full">{children}</main> : <ChatSidebar />}
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full bg-background overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
