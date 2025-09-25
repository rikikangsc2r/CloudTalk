'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useJsonBlob } from '@/hooks/useJsonBlob'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Paperclip, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Message } from '@/types'
import { encryptMessage } from '@/lib/crypto'

export function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { user } = useAuth()
  const { data, updateData } = useJsonBlob();
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async (imageUrl?: string) => {
    if (!user || !data || (!text.trim() && !imageUrl)) return
    setIsSending(true)

    try {
        const encryptedText = text.trim() ? encryptMessage(text.trim()) : '';

        const newMessage: Message = {
            id: Date.now().toString(),
            text: encryptedText,
            senderId: user.uid,
            timestamp: new Date().toISOString(),
            ...(imageUrl && { imageUrl }),
        };

        const updatedChats = data.chats.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = [...(chat.messages || []), newMessage];
                const otherUserId = chat.users.find(uid => uid !== user.uid);
                const unreadCounts = { ...(chat.unreadCounts || {}) };
                if (otherUserId) {
                    unreadCounts[otherUserId] = (unreadCounts[otherUserId] || 0) + 1;
                }

                return { 
                    ...chat, 
                    messages: updatedMessages,
                    lastMessage: {
                        text: newMessage.text || 'Image',
                        timestamp: newMessage.timestamp,
                    },
                    unreadCounts,
                };
            }
            return chat;
        });

        await updateData({ ...data, chats: updatedChats });

      setText('')
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({ title: 'Error', description: 'Could not send message.', variant: 'destructive'})
    } finally {
      setIsSending(false)
    }
  }
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return;

    setIsSending(true)
    try {
        // In a real app, you'd upload this to a service and get a URL.
        // For this demo, we'll use a data URL as a placeholder.
        const reader = new FileReader();
        reader.onloadend = () => {
            handleSendMessage(reader.result as string);
        }
        reader.readAsDataURL(file);

    } catch (error) {
        console.error("Error handling file:", error)
        toast({ title: 'Error', description: 'Could not process image.', variant: 'destructive' })
    } finally {
        // setIsSending is handled in handleSendMessage
    }
  }

  return (
    <div className="p-4 border-t bg-card/30">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="flex items-center gap-2"
      >
        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
          <Paperclip />
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className='hidden' disabled={isSending} />

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || (!text.trim() && !fileInputRef.current?.files?.length)}>
          {isSending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </div>
  )
}
