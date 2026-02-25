'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
