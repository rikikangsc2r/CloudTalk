'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MessageSquareText } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.'),
    password: z.string().min(1, 'Password is required.'),
});

export function LoginCard() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    setIsSigningIn(true);
    try {
      await login(values.username);
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: "Could not sign in. Please try again.",
      });
    } finally {
        setIsSigningIn(false);
    }
  };

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSigningIn}>
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
