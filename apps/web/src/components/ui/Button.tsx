import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'gradient-primary text-white shadow-md focus:ring-blue-500',
    secondary: 'gradient-elevated border text-gray-700 shadow-sm focus:ring-blue-500',
    success: 'gradient-success text-white shadow-md focus:ring-green-500',
    warning: 'gradient-warning text-white shadow-md focus:ring-amber-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    primary: { boxShadow: 'var(--shadow-md)' },
    secondary: { 
      background: 'var(--gradient-elevated)',
      borderColor: 'var(--neutral-200)',
      boxShadow: 'var(--shadow-sm)'
    },
    success: { boxShadow: 'var(--shadow-md)' },
    warning: { boxShadow: 'var(--shadow-md)' },
    danger: { boxShadow: 'var(--shadow-md)' },
    ghost: {}
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            style={{ borderTopColor: 'transparent' }}
          />
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : ''}`}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </div>
    </button>
  );
}