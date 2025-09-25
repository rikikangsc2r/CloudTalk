'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfile, JsonBlobData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const JSONBLOB_API_URL = 'https://jsonblob.com/api/jsonBlob/1420617466761109504';

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(JSONBLOB_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data from JSONBlob');
      }
      const blobData = await response.json();
      setData(blobData);
    } catch (err: any) {
      setError(err);
      toast({ title: 'Error', description: 'Could not load app data.', variant: 'destructive' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const updateData = async (newData: JsonBlobData) => {
    // Set loading to true only for the update operation, not for the whole app
    // setLoading(true); 
    try {
        const response = await fetch(JSONBLOB_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            throw new Error('Failed to update data in JSONBlob');
        }
        setData(newData); // Optimistic update
    } catch (err: any) {
        setError(err);
        toast({ title: 'Error', description: 'Could not save changes.', variant: 'destructive' });
        console.error(err);
        await fetchData(); // Re-fetch to revert optimistic update on failure
    } finally {
       // setLoading(false);
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('chat-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, [fetchData]);

  const login = async (username: string) => {
    // Ensure data, data.users, and data.chats are initialized
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
            // Create a new user
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
