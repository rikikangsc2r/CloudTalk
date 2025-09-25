'use client'
import { ChatView } from '@/components/chat/ChatView';
import { useJsonBlob } from '@/hooks/useJsonBlob';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';
import { notFound, useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user, loading: isUserLoading } = useAuth();
  const { data, loading: isChatLoading } = useJsonBlob();

  if (isUserLoading || isChatLoading) {
    // You can return a loading skeleton here
    return <div>Loading...</div>;
  }
  
  const chat = data?.chats.find(c => c.id === chatId);
  
  if (!chat || !user || !chat.users.includes(user.uid)) {
    return notFound();
  }

  const otherUserId = chat.users.find((uid: string) => uid !== user.uid);
  const otherUser = data?.users.find((u: UserProfile) => u.uid === otherUserId);
  
  if (!otherUser) {
    return notFound();
  }

  return <ChatView chatId={chatId} otherUser={otherUser} />;
}
