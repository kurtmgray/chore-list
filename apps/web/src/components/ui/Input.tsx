import { type ReactNode, type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'ghost';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'border bg-white px-3 py-2 text-sm focus:ring-blue-500',
    ghost: 'border-0 bg-transparent px-0 py-1 text-base focus:ring-0 focus:border-b-2'
  };

  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${
    leftIcon ? 'pl-10' : ''
  } ${rightIcon ? 'pr-10' : ''} ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
  } ${className}`;

  const inputStyles = {
    default: {
      backgroundColor: 'var(--bg-surface)',
      borderColor: error ? 'var(--error-red)' : 'var(--neutral-200)',
      color: 'var(--neutral-900)'
    },
    ghost: {
      color: 'var(--neutral-900)',
      borderBottomColor: error ? 'var(--error-red)' : 'var(--neutral-300)'
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: 'var(--neutral-700)' }}
        >
          {label}
          {props.required && (
            <span style={{ color: 'var(--error-red)' }} className="ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span style={{ color: 'var(--neutral-400)' }}>{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          style={inputStyles[variant]}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span style={{ color: 'var(--neutral-400)' }}>{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          className="text-sm animate-pulse"
          style={{ color: 'var(--error-red)' }}
        >
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p 
          className="text-xs"
          style={{ color: 'var(--neutral-500)' }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const textareaClasses = `${baseClasses} ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  } ${className}`;

  const textareaStyles = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: error ? 'var(--error-red)' : 'var(--neutral-200)',
    color: 'var(--neutral-900)'
  };

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: 'var(--neutral-700)' }}
        >
          {label}
          {props.required && (
            <span style={{ color: 'var(--error-red)' }} className="ml-1">*</span>
          )}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        style={textareaStyles}
        {...props}
      />
      
      {error && (
        <p 
          className="text-sm animate-pulse"
          style={{ color: 'var(--error-red)' }}
        >
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p 
          className="text-xs"
          style={{ color: 'var(--neutral-500)' }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';