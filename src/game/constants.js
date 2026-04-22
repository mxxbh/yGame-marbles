export const MARBLE_TYPES = [
  { size: 12, color: "#bbdefb", score: 1 },
  { size: 17, color: "#ffc832", score: 2 },
  { size: 22, color: "#48dbfb", score: 4 },
  { size: 28, color: "#ff9ff3", score: 8 },
  { size: 35, color: "#54a0ff", score: 16 },
  { size: 44, color: "#5f27cd", score: 32 },
  { size: 55, color: "#00d2d3", score: 64 },
  { size: 70, color: "#ff6b6b", score: 128 },
  { size: 89, color: "#03c000", score: 256 },
];

export const MARBLE_CIRCLE_CONFIG = {
  isStatic: false,
  restitution: 0.5,
  friction: 0.4,
};

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
  background: "#1a1a2e",
  glass: "rgba(100, 180, 255, 0.4)",
  glassBorder: "rgba(255, 255, 255, 0.3)",
};
