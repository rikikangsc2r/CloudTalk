export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface Chat {
  id: string;
  users: string[];
  messages: Message[];
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  createdAt: string;
  otherUser?: UserProfile;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  imageUrl?: string;
}

export interface JsonBlobData {
    users: UserProfile[];
    chats: Chat[];
}
