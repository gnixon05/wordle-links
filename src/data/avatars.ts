export interface AvatarOption {
  category: 'golfball' | 'penguin';
  variant: string;
  label: string;
  emoji: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // Golf balls in costumes
  { category: 'golfball', variant: 'cowboy', label: 'Cowboy Golf Ball', emoji: '🤠', color: '#f0e68c' },
  { category: 'golfball', variant: 'pirate', label: 'Pirate Golf Ball', emoji: '🏴‍☠️', color: '#2c2c2c' },
  { category: 'golfball', variant: 'wizard', label: 'Wizard Golf Ball', emoji: '🧙', color: '#7b68ee' },
  { category: 'golfball', variant: 'ninja', label: 'Ninja Golf Ball', emoji: '🥷', color: '#1a1a2e' },
  { category: 'golfball', variant: 'astronaut', label: 'Astronaut Golf Ball', emoji: '🧑‍🚀', color: '#c0c0c0' },
  { category: 'golfball', variant: 'chef', label: 'Chef Golf Ball', emoji: '👨‍🍳', color: '#ffffff' },
  { category: 'golfball', variant: 'detective', label: 'Detective Golf Ball', emoji: '🕵️', color: '#8b7355' },
  { category: 'golfball', variant: 'superhero', label: 'Superhero Golf Ball', emoji: '🦸', color: '#dc143c' },
  { category: 'golfball', variant: 'viking', label: 'Viking Golf Ball', emoji: '⚔️', color: '#8b4513' },
  { category: 'golfball', variant: 'crown', label: 'Royal Golf Ball', emoji: '👑', color: '#ffd700' },

  // Penguins in golf shenanigans
  { category: 'penguin', variant: 'driving', label: 'Penguin Driving', emoji: '🏌️', color: '#87ceeb' },
  { category: 'penguin', variant: 'putting', label: 'Penguin Putting', emoji: '⛳', color: '#90ee90' },
  { category: 'penguin', variant: 'caddie', label: 'Penguin Caddie', emoji: '🐧', color: '#2f4f4f' },
  { category: 'penguin', variant: 'cart', label: 'Penguin in Cart', emoji: '🚗', color: '#32cd32' },
  { category: 'penguin', variant: 'trophy', label: 'Penguin Champion', emoji: '🏆', color: '#ffd700' },
  { category: 'penguin', variant: 'sunglasses', label: 'Cool Penguin', emoji: '😎', color: '#1e90ff' },
  { category: 'penguin', variant: 'visor', label: 'Penguin with Visor', emoji: '🧢', color: '#ff6347' },
  { category: 'penguin', variant: 'celebrating', label: 'Celebrating Penguin', emoji: '🎉', color: '#ff69b4' },
  { category: 'penguin', variant: 'sand', label: 'Penguin in Bunker', emoji: '🏖️', color: '#f4a460' },
  { category: 'penguin', variant: 'hole-in-one', label: 'Hole-in-One Penguin', emoji: '🎯', color: '#ff4500' },
];

export function getAvatarOption(category: string, variant: string): AvatarOption | undefined {
  return AVATAR_OPTIONS.find(a => a.category === category && a.variant === variant);
}

export function getDefaultAvatar(): AvatarOption {
  return AVATAR_OPTIONS[0];
}
