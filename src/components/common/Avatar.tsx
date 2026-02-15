import { AvatarChoice } from '../../types';
import { getAvatarOption, getDefaultAvatar } from '../../data/avatars';

interface AvatarProps {
  avatar: AvatarChoice;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({ avatar, size = 'medium', className = '' }: AvatarProps) {
  const option = getAvatarOption(avatar.category, avatar.variant) || getDefaultAvatar();
  const sizeClass = size === 'medium' ? '' : size;

  return (
    <div
      className={`avatar-circle ${sizeClass} ${className}`}
      style={{ backgroundColor: option.color }}
      title={option.label}
    >
      {option.emoji}
    </div>
  );
}
