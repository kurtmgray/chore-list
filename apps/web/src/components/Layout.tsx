import { type ReactNode } from 'react';
import { NavigationProvider } from './Navigation';
import { ErrorBoundary } from './ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        {/* Main content */}
        <ErrorBoundary fallback={
          <div className="flex items-center justify-center p-8">
            <p style={{ color: 'var(--neutral-600)' }}>
              Unable to load page content. Please refresh to try again.
            </p>
          </div>
        }>
          {children}
        </ErrorBoundary>
      </NavigationProvider>
    </ErrorBoundary>
  );
}
