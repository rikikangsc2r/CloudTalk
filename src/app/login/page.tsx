'use client';
import { LoginCard } from '@/components/auth/LoginCard';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      const from = searchParams.get('from') || '/chat';
      router.replace(from);
    }
  }, [user, loading, router, searchParams]);

  if (loading || user) {
    return (
       <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
         <Card className="w-full max-w-sm animate-pulse">
            <CardHeader className="text-center">
                <div className="mx-auto bg-muted text-muted-foreground p-3 rounded-full w-fit mb-4">
                    <MessageSquareText size={32} />
                </div>
              <CardTitle className="text-2xl font-headline">CloudTalk</CardTitle>
              <CardDescription>Connecting you to the cloud...</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full rounded-md bg-muted" />
            </CardContent>
          </Card>
       </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Suspense>
        <LoginCard />
      </Suspense>
    </main>
  );
}
