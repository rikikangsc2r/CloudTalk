'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { auth, firestore } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 227.4 7 195 19.3 166.6 34.2 124.9 59.8 82.2 94.6 51.8l37.3 37.3C96.9 119.3 64 185.8 64 261.8c0 97.2 79.1 176.2 176.2 176.2 97.2 0 176.2-79.1 176.2-176.2 0-21.6-3.8-42.2-10.7-62.1H261.8v89.9h148.9c-6.8 44.9-34.9 83.2-74.6 109.1-40.7 26.8-91.8 41-146.9 41-106.1 0-193.8-79.9-216.5-186.2-2.3-10.6-3.5-21.6-3.5-32.9 0-11.3 1.2-22.3 3.5-32.9C68.1 123.8 155.8 43.9 261.8 43.9c49.8 0 95.2 17.6 130.1 49.3l62.6-62.6C413.7 17.6 341.1 0 261.8 0 119.3 0 0 119.3 0 261.8s119.3 261.8 261.8 261.8C390.9 523.6 488 411.7 488 261.8z" transform="translate(0 -5.8)"/>
  </svg>
);


export function LoginCard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const from = searchParams.get('from') || '/chat';
      router.replace(from);
    }
  }, [user, loading, router, searchParams]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    } finally {
        setIsSigningIn(false);
    }
  };

  if (loading || user) {
    return (
        <Card className="w-full max-w-sm animate-pulse">
        <CardHeader className="text-center">
            <div className="mx-auto bg-muted text-muted-foreground p-3 rounded-full w-fit mb-4">
                <MessageSquareText size={32} />
            </div>
          <CardTitle className="text-2xl font-headline">CloudTalk</CardTitle>
          <CardDescription>Connecting you to the cloud...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-4 shadow-md">
            <MessageSquareText size={32} />
        </div>
        <CardTitle className="text-2xl font-headline">Welcome to CloudTalk</CardTitle>
        <CardDescription className="font-body">Your conversations, in the cloud.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSignIn} className="w-full" variant="outline" disabled={isSigningIn}>
          {isSigningIn ? (
            'Signing in...'
          ) : (
            <>
              <GoogleIcon />
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
