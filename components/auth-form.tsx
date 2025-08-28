"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  mode: "login" | "signup";
}

export function AuthForm({ className, mode, ...props }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  const supabase = createClient();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Apple auth error:', error);
      toast.error('Failed to authenticate with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
      toast.success('Check your email for the login link!');
    } catch (error) {
      console.error('Magic link error:', error);
      toast.error('Failed to send magic link');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const title = mode === 'login' ? 'Welcome back' : 'Create account';
  const description = mode === 'login' 
    ? 'Sign in to access your tools' 
    : 'Get started with ToolHub today';

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* OAuth Providers */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                onClick={handleAppleAuth}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C6.624 0 2.25 4.374 2.25 9.767c0 4.307 2.743 7.977 6.574 9.301.481-.302.883-.652 1.225-1.082-.44-.247-.837-.59-1.155-1.023C6.895 15.654 5.25 12.886 5.25 9.767 5.25 6.025 8.275 3 12.017 3s6.767 3.025 6.767 6.767c0 3.119-1.645 5.887-3.644 7.196-.318.433-.715.776-1.155 1.023.342.43.744.78 1.225 1.082 3.831-1.324 6.574-4.994 6.574-9.301C21.784 4.374 17.41 0 12.017 0z"/>
                  <path d="M15.297 6.424c-.897 0-1.764.312-2.432.876-.627.528-1.038 1.244-1.158 2.013-.015.095-.024.191-.024.287 0 1.657 1.343 3 3 3s3-1.343 3-3c0-.096-.009-.192-.024-.287-.12-.769-.531-1.485-1.158-2.013-.668-.564-1.535-.876-2.432-.876z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={magicLinkLoading}
              >
                {magicLinkLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/sign-up" className="underline hover:text-primary">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link href="/auth/login" className="underline hover:text-primary">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}