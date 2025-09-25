import { ChatView } from '@/components/chat/ChatView';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { notFound } from 'next/navigation';
import { getAuth } from 'firebase/auth'; // We need to check auth on server too

async function getChatData(chatId: string, currentUserId: string | undefined) {
    if (!currentUserId) return notFound();

    const chatRef = doc(firestore, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists() || !chatSnap.data().users.includes(currentUserId)) {
        return notFound();
    }

    const chatData = chatSnap.data();
    const otherUserId = chatData.users.find((uid: string) => uid !== currentUserId);

    if (!otherUserId) return notFound();

    const userRef = doc(firestore, 'users', otherUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return notFound();
    }
    
    return {
        chatId,
        otherUser: userSnap.data() as UserProfile
    };
}


export default async function ChatPage({ params }: { params: { chatId: string } }) {
  // This is a placeholder for server-side auth check
  // In a real app, you would use a library like next-auth or your own session management
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const chatData = await getChatData(params.chatId, currentUserId);

  if (!chatData) {
    return notFound();
  }

  return <ChatView chatId={chatData.chatId} otherUser={chatData.otherUser} />;
}
