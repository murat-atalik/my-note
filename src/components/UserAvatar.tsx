import React from 'react';

interface AvatarProps {
  avatar?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const isEmoji = (str?: string): boolean => {
  if (!str) return false;
  // If it starts with http, data:, or /, it's an image url
  if (str.startsWith('http') || str.startsWith('data:') || str.startsWith('/')) {
    return false;
  }
  return true;
};

export const UserAvatar: React.FC<AvatarProps> = ({
  avatar = '🦊',
  name = 'Kullanıcı',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (isEmoji(avatar)) {
    return (
      <div
        className={`rounded-full bg-slate-100 flex items-center justify-center select-none shrink-0 border border-slate-200/80 shadow-2xs ${currentSizeClass} ${className}`}
        title={name}
      >
        <span className="leading-none">{avatar}</span>
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className={`rounded-full object-cover shrink-0 ${currentSizeClass} ${className}`}
    />
  );
};
