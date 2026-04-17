export const MARBLE_TYPES = [
  { size: 12, color: '#ff6b6b', pattern: 'circle', name: 'small' },
  { size: 17, color: '#feca57', pattern: 'triangle', name: 'tiny' },
  { size: 22, color: '#48dbfb', pattern: 'diamond', name: 'medium' },
  { size: 28, color: '#ff9ff3', pattern: 'star', name: 'large' },
  { size: 35, color: '#54a0ff', pattern: 'flower', name: 'xlarge' },
  { size: 44, color: '#5f27cd', pattern: 'sun', name: 'giant' },
  { size: 55, color: '#00d2d3', pattern: 'moon', name: 'colossal' },
  { size: 70, color: '#ff6b6b', pattern: 'planet', name: 'maximus' },
];

export const SCORE_MAP = [1, 2, 4, 8, 16, 32, 64, 128];

export const GAME_CONFIG = {
  glassWidth: 300,
  glassHeight: 480,
  glassLeft: 20,
  glassTop: 40,
  spoutX: 170,
  spoutY: 60,
  gravity: 0.3,
  friction: 0.98,
  restitution: 0.6,
  mergeDistance: 0.8,
};

export const COLORS = {
  background: '#1a1a2e',
  glass: 'rgba(100, 180, 255, 0.4)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
};