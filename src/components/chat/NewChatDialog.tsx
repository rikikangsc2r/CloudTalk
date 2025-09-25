'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, addDoc, getDocs as getChatDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'


export function NewChatDialog() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !user) return

    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('uid', '!=', user.uid))
        const querySnapshot = await getDocs(q)
        const usersData = querySnapshot.docs.map(doc => doc.data() as UserProfile)
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({ title: 'Error', description: 'Could not fetch users.' })
      }
      setLoading(false)
    }

    fetchUsers()
  }, [open, user, toast])

  const handleCreateChat = async (otherUser: UserProfile) => {
    if (!user) return
    
    // Check if a chat already exists
    const chatsRef = collection(firestore, 'chats');
    const q = query(chatsRef, where('users', 'in', [[user.uid, otherUser.uid], [otherUser.uid, user.uid]]));
    
    try {
        const chatSnapshot = await getChatDocs(q);
        if (!chatSnapshot.empty) {
            // Chat already exists, navigate to it
            const chatId = chatSnapshot.docs[0].id;
            router.push(`/chat/${chatId}`);
        } else {
            // Create a new chat
            const newChatRef = await addDoc(collection(firestore, 'chats'), {
                users: [user.uid, otherUser.uid],
                createdAt: serverTimestamp(),
            });
            router.push(`/chat/${newChatRef.id}`);
        }
        setOpen(false)
    } catch (error) {
        console.error("Error creating or finding chat:", error)
        toast({ title: 'Error', description: 'Could not start a new chat.' })
    }
  }

  const filteredUsers = users.filter(u =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquarePlus />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <Input 
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-72">
          <div className="p-4 space-y-4">
            {loading ? <p>Loading users...</p> : 
              filteredUsers.map(u => (
                <div key={u.uid} onClick={() => handleCreateChat(u)} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-accent rounded-lg">
                  <Avatar>
                    <AvatarImage src={u.photoURL} alt={u.displayName} />
                    <AvatarFallback><User/></AvatarFallback>
                  </Avatar>
                  <p>{u.displayName}</p>
                </div>
            ))}
            {!loading && filteredUsers.length === 0 && (
                <p className='text-center text-sm text-muted-foreground'>No users found.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
