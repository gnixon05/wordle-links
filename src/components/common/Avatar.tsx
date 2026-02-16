import { AvatarChoice } from '../../types';
import { getAvatarOption, getDefaultAvatar } from '../../data/avatars';
import { getAvatarSvg } from './AvatarSvgs';

interface AvatarProps {
  avatar: AvatarChoice;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({ avatar, size = 'medium', className = '' }: AvatarProps) {
  const option = getAvatarOption(avatar.category, avatar.variant) || getDefaultAvatar();
  const sizeClass = size === 'medium' ? '' : size;
  const svg = getAvatarSvg(avatar.category, avatar.variant);

  return (
    <div
      className={`avatar-circle ${sizeClass} ${className}`}
      style={{ backgroundColor: option.color }}
      title={option.label}
    >
      {svg || option.emoji}
    </div>
  );
}
