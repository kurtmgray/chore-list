import { type ReactNode } from 'react';
import { FadeInUp } from './PageTransition';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'standard' | 'enhanced';
  actionButton?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: 'default' | 'error' | 'warning' | 'success';
  }>;
  delay?: number;
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  variant = 'standard',
  actionButton,
  stats,
  delay = 0,
  children,
}: PageHeaderProps) {
  const getStatColor = (color?: string) => {
    switch (color) {
      case 'error':
        return 'var(--error-red)';
      case 'warning':
        return 'var(--warning-amber)';
      case 'success':
        return 'var(--success-green)';
      default:
        return 'var(--neutral-900)';
    }
  };

  if (variant === 'enhanced') {
    return (
      <FadeInUp delay={delay}>
        <div className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl lg:text-2xl font-semibold tracking-tight mb-1"
                style={{ color: 'var(--neutral-900)' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-sm lg:text-base"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {actionButton && (
              <div className="flex-shrink-0">{actionButton}</div>
            )}
          </div>

          {/* Stats section */}
          {stats && stats.length > 0 && (
            <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-1">
              {stats.map((stat, index) => (
                <div key={index} className="flex-shrink-0">
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--neutral-600)' }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-xl lg:text-2xl font-semibold"
                    style={{ color: getStatColor(stat.color) }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional children */}
          {children}
        </div>
      </FadeInUp>
    );
  }

  // Standard variant
  return (
    <FadeInUp delay={delay}>
      <div className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover">
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl lg:text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--neutral-900)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-sm lg:text-base"
              style={{ color: 'var(--neutral-600)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actionButton && <div className="flex-shrink-0">{actionButton}</div>}

        {children}
      </div>
    </FadeInUp>
  );
}
