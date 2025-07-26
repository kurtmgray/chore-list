import { type ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{
        transitionTimingFunction: 'var(--ease-spring)'
      }}
    >
      {children}
    </div>
  );
}

export function StaggeredList({ 
  children, 
  staggerDelay = 100,
  className = '' 
}: { 
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>([]);

  useEffect(() => {
    // Stagger the appearance of list items
    const childrenArray = Array.isArray(children) ? children : [children];
    const timers: NodeJS.Timeout[] = [];

    childrenArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => {
          const newVisible = [...prev];
          newVisible[index] = true;
          return newVisible;
        });
      }, index * staggerDelay);
      
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [children, staggerDelay]);

  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-500 ${
            visibleItems[index]
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionTimingFunction: 'var(--ease-spring)',
            transitionDelay: `${index * 50}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function FadeInUp({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay + 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-600 ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
      } ${className}`}
      style={{
        transitionTimingFunction: 'var(--ease-spring)'
      }}
    >
      {children}
    </div>
  );
}