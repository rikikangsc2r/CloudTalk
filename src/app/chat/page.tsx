import { MessageCircle } from 'lucide-react';

export default function ChatHomePage() {
  return (
    <div className="hidden md:flex h-full flex-col items-center justify-center bg-background text-center p-4">
        <MessageCircle size={64} className="text-muted-foreground/50" />
      <h2 className="mt-4 text-2xl font-bold font-headline text-foreground">Welcome to CloudTalk</h2>
      <p className="text-muted-foreground max-w-sm">Select a chat from the sidebar to start messaging. Your conversations are saved in the cloud and accessible from any device.</p>
    </div>
  );
}
