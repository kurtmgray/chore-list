import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { UserSwitcher } from './UserSwitcher';

interface NavigationItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  { icon: '🏠', label: 'Dashboard', path: '/' },
  { icon: '📅', label: 'Calendar', path: '/calendar' },
  { icon: '📋', label: 'All Chores', path: '/chores' },
  { icon: '⚖️', label: 'Balance', path: '/balance' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DesktopSidebar({
  isCollapsed,
  onToggleCollapse,
}: DesktopSidebarProps) {
  const location = useLocation();

  return (
    <nav
      className={`fixed left-0 top-0 h-full transition-all duration-300 ease-out z-30 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--neutral-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderBottomColor: 'var(--neutral-200)' }}
      >
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--neutral-900)' }}
            >
              ChoreShare
            </h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg button-hover"
            style={{ color: 'var(--neutral-600)' }}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Switcher in Sidebar */}
        {!isCollapsed && (
          <div className="mb-2">
            <UserSwitcher />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="p-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
              `}
              style={{
                backgroundColor: isActive
                  ? 'var(--primary-600)'
                  : 'transparent',
                color: isActive ? 'white' : 'var(--neutral-700)',
                boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                transform:
                  isActive && !isCollapsed ? 'translateX(2px)' : 'none',
              }}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span
                  className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--error-red)',
                    color: isActive ? 'white' : 'white',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBottomNavigation() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 md:hidden grid grid-cols-4 z-40"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--neutral-200)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center p-2 transition-all duration-200"
            style={{
              color: isActive ? 'var(--primary-600)' : 'var(--neutral-600)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span
              className="text-xs font-medium leading-none"
              style={{
                color: isActive ? 'var(--primary-600)' : 'var(--neutral-600)',
              }}
            >
              {item.label === 'All Chores' ? 'Chores' : item.label}
            </span>
            {item.badge && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--error-red)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {item.badge}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div
      // className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Mobile Header */}
      <header
        className="md:hidden glass-morphism sticky top-0 z-40 fade-in"
        style={{
          borderBottomColor: 'var(--glass-border)',
        }}
      >
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--neutral-900)' }}
              >
                ChoreShare
              </h1>
            </div>

            {/* User switcher on mobile */}
            <UserSwitcher />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-out pb-16 md:pb-0 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {/* <div className="max-w-7xl mx-auto px-4 py-6"> */}
        {children}
        {/* </div> */}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
}
