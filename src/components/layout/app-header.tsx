
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { AuthDialog } from '@/components/auth/auth-dialog';

type AppHeaderProps = {
  title: string;
  showAuthButtons?: boolean;
};

export function AppHeader({ title, showAuthButtons = true }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<'login' | 'signup' | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const getInitials = (email: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt="User avatar" />
                      <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               showAuthButtons && (
                <>
                    <Button variant="ghost" onClick={() => setAuthMode('login')}>Log In</Button>
                    <Button onClick={() => setAuthMode('signup')}>Sign Up</Button>
                </>
               )
            )}
        </div>
      </header>
      <AuthDialog mode={authMode} onModeChange={setAuthMode} />
    </>
  );
}
