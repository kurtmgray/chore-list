import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // In production, you'd send this to your error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
            style={{ backgroundColor: 'var(--error-red)', color: 'white' }}
          >
            ⚠️
          </div>
          
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--neutral-900)' }}
          >
            Something went wrong
          </h2>
          
          <p 
            className="text-sm mb-6 max-w-md leading-relaxed"
            style={{ color: 'var(--neutral-600)' }}
          >
            We encountered an unexpected error. Don't worry - your data is safe. 
            Try refreshing the page or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 w-full max-w-lg">
              <summary 
                className="cursor-pointer text-xs font-medium mb-2"
                style={{ color: 'var(--neutral-500)' }}
              >
                Error Details (Development Only)
              </summary>
              <pre 
                className="text-xs p-3 rounded-lg overflow-auto text-left"
                style={{ 
                  backgroundColor: 'var(--neutral-100)',
                  color: 'var(--neutral-800)',
                  maxHeight: '200px'
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                background: 'var(--gradient-primary)',
                color: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                background: 'var(--gradient-elevated)',
                color: 'var(--neutral-700)',
                border: '1px solid var(--neutral-200)'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for common use cases
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}