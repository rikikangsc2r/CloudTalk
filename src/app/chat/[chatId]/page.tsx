'use client'
import { ChatView } from '@/components/chat/ChatView';
import { useJsonBlob } from '@/hooks/useJsonBlob';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile, Chat } from '@/types';
import { notFound } from 'next/navigation';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { user, loading: isUserLoading } = useAuth();
  const { data, loading: isChatLoading } = useJsonBlob();

  if (isUserLoading || isChatLoading) {
    // You can return a loading skeleton here
    return <div>Loading...</div>;
  }
  
  const chat = data?.chats.find(c => c.id === params.chatId);
  
  if (!chat || !user || !chat.users.includes(user.uid)) {
    return notFound();
  }

  const otherUserId = chat.users.find((uid: string) => uid !== user.uid);
  const otherUser = data?.users.find((u: UserProfile) => u.uid === otherUserId);
  
  if (!otherUser) {
    return notFound();
  }

  return <ChatView chatId={params.chatId} otherUser={otherUser} />;
}
