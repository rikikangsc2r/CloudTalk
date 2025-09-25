'use client'
import { ChatView } from '@/components/chat/ChatView';
import { doc } from 'firebase/firestore';
import { useDoc, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import type { UserProfile } from '@/types';
import { notFound } from 'next/navigation';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const chatRef = useMemoFirebase(() => {
    if (!firestore || !params.chatId) return null;
    return doc(firestore, 'chats', params.chatId);
  }, [firestore, params.chatId]);

  const { data: chatData, isLoading: isChatLoading } = useDoc(chatRef);
  
  const otherUserId = useMemoFirebase(() => {
    if (!chatData || !user) return null;
    return chatData.users?.find((uid: string) => uid !== user.uid);
  }, [chatData, user]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !otherUserId) return null;
    return doc(firestore, 'users', otherUserId);
  }, [firestore, otherUserId]);

  const { data: otherUserData, isLoading: isUserDocLoading } = useDoc<UserProfile>(userRef);

  if (isUserLoading || isChatLoading || isUserDocLoading) {
    // You can return a loading skeleton here
    return <div>Loading...</div>;
  }
  
  if (!chatData || !otherUserData || !chatData.users.includes(user?.uid)) {
    return notFound();
  }

  return <ChatView chatId={params.chatId} otherUser={otherUserData} />;
}
