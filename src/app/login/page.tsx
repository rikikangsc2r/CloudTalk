import { LoginCard } from '@/components/auth/LoginCard';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Suspense>
        <LoginCard />
      </Suspense>
    </main>
  );
}
