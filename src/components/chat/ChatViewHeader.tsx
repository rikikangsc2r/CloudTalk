'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types'
import { ArrowLeft, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ChatViewHeader({ otherUser }: { otherUser: UserProfile }) {
    const router = useRouter()
  return (
    <div className="flex items-center p-4 border-b bg-card/30">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherUser.photoURL} alt={otherUser.displayName} />
        <AvatarFallback>
            <User />
        </AvatarFallback>
      </Avatar>
      <div className="ml-4">
        <h2 className="text-lg font-bold font-headline">{otherUser.displayName}</h2>
      </div>
    </div>
  )
}
