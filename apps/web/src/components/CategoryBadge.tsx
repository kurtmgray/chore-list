interface CategoryBadgeProps {
  name: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({ 
  name, 
  icon, 
  color = '#6b7280', 
  size = 'md',
  className = '' 
}: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Convert hex color to RGB for background with opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 107, g: 114, b: 128 }; // fallback to gray
  };

  const rgb = hexToRgb(color);
  const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

  return (
    <span 
      className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${sizeClasses[size]} ${className}
      `}
      style={{ 
        backgroundColor,
        borderColor,
        color
      }}
    >
      {icon && (
        <span className={iconSizes[size]}>
          {icon}
        </span>
      )}
      <span>{name}</span>
    </span>
  );
}