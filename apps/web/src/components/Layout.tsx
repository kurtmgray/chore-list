import { type ReactNode } from 'react';
import { NavigationProvider } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <NavigationProvider>
      {/* Main content */}
      {children}
    </NavigationProvider>
  );
}
