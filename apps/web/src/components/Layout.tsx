import { type ReactNode } from 'react';
import { UserSwitcher } from './UserSwitcher';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Enhanced glassmorphism header */}
      <header
        className="glass-morphism sticky top-0 z-40 fade-in"
        style={{
          borderBottomColor: 'var(--glass-border)',
        }}
      >
        <div className="px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 lg:h-16">
            {/* Logo - smaller on mobile */}
            <div className="flex items-center">
              <h1
                className="text-lg lg:text-xl font-semibold tracking-tight"
                style={{ color: 'var(--neutral-900)' }}
              >
                Chore Share
              </h1>
            </div>

            {/* User switcher - more compact */}
            <UserSwitcher />
          </div>
        </div>
      </header>

      {/* Main content with mobile-optimized spacing */}
      <main className="px-4 lg:px-6 py-4 lg:py-6 max-w-6xl mx-auto">
        {children}
      </main>

      {/* Mobile safe area bottom padding */}
      <div className="h-4 lg:h-0"></div>
    </div>
  );
}
