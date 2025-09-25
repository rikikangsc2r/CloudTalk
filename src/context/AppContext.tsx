'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { UserProfile, JsonBlobData, Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

const API_URL = '/api/data';

interface AppContextType {
  user: UserProfile | null;
  data: JsonBlobData | null;
  loading: boolean;
  error: Error | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  fetchData: () => Promise<void>;
  updateData: (newData: JsonBlobData) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<JsonBlobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const dataRef = useRef(data);
  const pathname = usePathname();


  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const fetchData = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
    }
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }
      const blobData: JsonBlobData = await response.json();
      
      if (isPolling && dataRef.current && user) {
        const previousData = dataRef.current;
        const currentChatId = pathname.split('/chat/')[1];

        // Process unread count updates
        blobData.chats.forEach((newChat: Chat) => {
            const oldChat = previousData.chats.find(c => c.id === newChat.id);
            if (!oldChat && newChat.users.includes(user.uid)) {
                // It's a new chat for this user
                const otherUser = blobData.users.find(u => u.uid === newChat.users.find(uid => uid !== user.uid));
                toast({
                    title: `New chat from ${otherUser?.displayName || 'Unknown'}`,
                    description: 'You have been added to a new conversation.',
                });
            } else if (oldChat) {
                const oldUnread = oldChat.unreadCounts?.[user.uid] ?? 0;
                const newUnread = newChat.unreadCounts?.[user.uid] ?? 0;
                const lastNewMessage = newChat.messages.length > 0 ? newChat.messages[newChat.messages.length - 1] : null;

                if (newUnread > oldUnread && lastNewMessage && newChat.id !== currentChatId) {
                    const sender = blobData.users.find((u: UserProfile) => u.uid === lastNewMessage.senderId);
                    toast({
                        title: `New message from ${sender?.displayName || 'Unknown'}`,
                        description: lastNewMessage.text || 'Sent an image',
                    });
                }
            }
        });
      }

      setData(blobData);
    } catch (err: any) {
      setError(err);
      if (!isPolling) {
        toast({ title: 'Error', description: 'Could not load app data.', variant: 'destructive' });
      }
      console.error(err);
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [toast, user, pathname]);
  
  const updateData = async (newData: JsonBlobData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            throw new Error('Failed to update data via API');
        }
        setData(newData); 
    } catch (err: any) {
        setError(err);
        toast({ title: 'Error', description: 'Could not save changes.', variant: 'destructive' });
        console.error(err);
        await fetchData();
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('chat-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
        const interval = setInterval(() => {
            fetchData(true);
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }
  }, [user, fetchData]);

  const login = async (username: string) => {
    const currentData = data || { users: [], chats: [] };
    if (!currentData.users) {
        currentData.users = [];
    }
    if (!currentData.chats) {
        currentData.chats = [];
    }

    try {
        let userToLogin = currentData.users.find(u => u.displayName.toLowerCase() === username.toLowerCase());

        if (!userToLogin) {
            userToLogin = {
                uid: Date.now().toString(),
                displayName: username,
                email: `${username.toLowerCase()}@example.com`,
                photoURL: `https://picsum.photos/seed/${username}/100/100`,
            };
            const updatedUsers = [...currentData.users, userToLogin];
            await updateData({ ...currentData, users: updatedUsers });
        }
        
        setUser(userToLogin);
        localStorage.setItem('chat-user', JSON.stringify(userToLogin));
    } catch (error) {
        console.error("Error during login:", error);
        toast({ title: 'Error', description: 'Could not log in. Please try again.' });
        throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chat-user');
  };

  return (
    <AppContext.Provider value={{ user, data, loading, error, login, logout, fetchData, updateData }}>
      {children}
    </AppContext.Provider>
  );
};
