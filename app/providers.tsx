'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

function HeroUIWrapper({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <HeroUIWrapper>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </HeroUIWrapper>
    </ThemeProvider>
  );
}
