'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { setTheme, theme } = useTheme();

  // Force light mode on auth pages
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  return (
    <div className="min-h-screen w-full light" data-theme="light">
      {children}
    </div>
  );
}
