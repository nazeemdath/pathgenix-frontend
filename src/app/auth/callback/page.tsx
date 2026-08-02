'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function AuthCallbackPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading) {
            if (user) {
                // Redirect to the home page or dashboard after a short delay
                setTimeout(() => router.push('/'), 500);
            } else {
                // Fallback to home if auth state is missing
                router.push('/');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <LoadingSpinner className="h-12 w-12" />
            <div className="text-center">
                <h1 className="text-xl font-semibold">Signing you in...</h1>
                <p className="text-muted-foreground">Please wait while we prepare your journey.</p>
            </div>
        </div>
    );
}
