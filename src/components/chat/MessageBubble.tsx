'use client'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { decryptMessage } from '@/lib/crypto'
import { useMemo } from 'react'

export function MessageBubble({ message }: { message: Message }) {
  const { user } = useAuth()
  const isCurrentUser = user?.uid === message.senderId

  const decryptedText = useMemo(() => {
    if (!message.text) return '';
    return decryptMessage(message.text);
  }, [message.text]);

  return (
    <div className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-2 break-words shadow-sm',
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none border'
        )}
      >
        {message.imageUrl ? (
            <div className='p-1'>
                 <Image
                    src={message.imageUrl}
                    alt="Sent image"
                    width={300}
                    height={200}
                    className="rounded-md object-cover cursor-pointer"
                    onClick={() => window.open(message.imageUrl, '_blank')}
                />
                {decryptedText && <p className='pt-2'>{decryptedText}</p>}
            </div>
        ) : (
          <p>{decryptedText}</p>
        )}
      </div>
    </div>
  )
}
