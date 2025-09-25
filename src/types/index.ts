import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface Chat {
  id: string;
  users: string[];
  lastMessage?: Message;
  // For client-side display, we'll merge user profile data
  otherUser?: UserProfile;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
  imageUrl?: string;
}
