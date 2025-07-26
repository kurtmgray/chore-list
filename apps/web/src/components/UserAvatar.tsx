interface UserAvatarProps {
  avatar: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ 
  avatar, 
  name, 
  size = 'md', 
  showName = false,
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const containerClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`${containerClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200`}
        title={name}
      >
        <span className={sizeClasses[size]}>
          {avatar}
        </span>
      </div>
      
      {showName && (
        <span className="text-sm font-medium text-gray-700">
          {name}
        </span>
      )}
    </div>
  );
}