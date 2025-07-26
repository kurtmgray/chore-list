import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border shadow-sm',
    elevated: 'gradient-surface shadow-elevated',
    glass: 'glass-morphism',
    gradient: 'gradient-surface shadow-lg'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 lg:p-5',
    lg: 'p-6 lg:p-8'
  };

  const hoverClass = hover ? 'card-hover' : '';

  const variantStyles = {
    default: { 
      backgroundColor: 'var(--bg-surface)',
      borderColor: 'var(--neutral-200)',
      boxShadow: 'var(--shadow-sm)'
    },
    elevated: {
      boxShadow: 'var(--shadow-lg)'
    },
    glass: {},
    gradient: {
      boxShadow: 'var(--shadow-lg)'
    }
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '',
  ...props 
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`pb-4 border-b ${className}`}
      style={{ borderBottomColor: 'var(--neutral-200)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ 
  children, 
  className = '',
  ...props 
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '',
  ...props 
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`pt-4 border-t ${className}`}
      style={{ borderTopColor: 'var(--neutral-200)' }}
      {...props}
    >
      {children}
    </div>
  );
}