'use client'
import type { UserProfile } from '@/types'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'
import { ChatViewHeader } from './ChatViewHeader'

interface ChatViewProps {
  chatId: string
  otherUser: UserProfile
}

export function ChatView({ chatId, otherUser }: ChatViewProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatViewHeader otherUser={otherUser} />
      <MessageList chatId={chatId} />
      <MessageInput chatId={chatId} />
    </div>
  )
}
