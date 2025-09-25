'use client'
import { useState, useRef } from 'react'
import { collection, serverTimestamp, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase'
import { getStorage } from 'firebase/storage';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Paperclip, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async (imageUrl?: string) => {
    if (!user || !firestore || (!text.trim() && !imageUrl)) return
    setIsSending(true)

    try {
      const messageData = {
        text: text.trim(),
        senderId: user.uid,
        timestamp: serverTimestamp(),
        ...(imageUrl && { imageUrl }),
      };

      const messagesCol = collection(firestore, 'chats', chatId, 'messages');
      addDocumentNonBlocking(messagesCol, messageData);
      
      const chatRef = doc(firestore, 'chats', chatId);
      updateDocumentNonBlocking(chatRef, {
        lastMessage: {
          text: text.trim() || 'Image',
          timestamp: serverTimestamp(),
        }
      });

      setText('')
    } catch (error) {
      console.error("Error sending message:", error)
      toast({ title: 'Error', description: 'Could not send message.', variant: 'destructive'})
    } finally {
      setIsSending(false)
    }
  }
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !firestore) return

    setIsSending(true)
    try {
        const storage = getStorage(firestore.app);
        const storageRef = ref(storage, `chat_images/${chatId}/${user.uid}_${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        await handleSendMessage(downloadURL)
    } catch (error) {
        console.error("Error uploading file:", error)
        toast({ title: 'Error', description: 'Could not upload image.', variant: 'destructive' })
    } finally {
        setIsSending(false)
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
