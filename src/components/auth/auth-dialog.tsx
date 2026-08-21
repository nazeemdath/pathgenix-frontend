'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

interface AuthDialogProps {
  mode: 'login' | 'signup' | null;
  onModeChange: (mode: 'login' | 'signup' | null) => void;
}

export function AuthDialog({ mode, onModeChange }: AuthDialogProps) {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onModeChange(null);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    await login(username, password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'Passwords do not match. Please verify your password confirmation.',
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        await handleLogin();
      } else {
        const authEmail = email || `${username.toLowerCase()}@path-genix.user`;
        await signup(authEmail, password, {
          username,
          phone,
          email,
          confirmPassword,
        });
      }
      router.push('/auth/callback');
      handleOpenChange(false);
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' && mode === 'login') {
        description = 'Login failed. Please check your credentials and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        description = error.message || 'This account already exists. Please try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        description = 'The generated email for your username is invalid. Please try a different username.';
      } else if (error.code === 'auth/weak-password' || error.code?.includes('WEAK_PASSWORD')) {
        description = 'Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.';
      } else if (error.message) {
        description = error.message;
      }

      toast({
        variant: 'destructive',
        title: `${mode === 'login' ? 'Login' : 'Sign Up'} Failed`,
        description: description,
      });
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    onModeChange(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <Dialog open={!!mode} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <GraduationCap className="h-10 w-10 text-primary mb-2" />
          <DialogTitle className="text-2xl font-headline">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Enter your username and password to log in.'
              : 'Create your account to start your journey.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="your_username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {mode === 'signup' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••"
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-muted-foreground">
                Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special char.
              </p>
            )}
          </div>
          {mode === 'signup' && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : (mode === 'login' ? 'Login' : 'Create Account')}
          </Button>
        </form>
        <div className="mt-2 text-center text-sm">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <Button variant="link" className="p-0 h-auto" onClick={switchMode}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
