export const MARBLE_TYPES = [
  { size: 12, color: "#b5d9f3", score: 1, shape: "circle" },
  { size: 17, color: "#ebdf7a", score: 2, shape: "circle" },
  { size: 22, color: "#80cbc4", score: 4, shape: "circle" },
  { size: 28, color: "#f48fb1", score: 8, shape: "circle" },
  { size: 35, color: "#42a5f5", score: 16, shape: "oval" },
  { size: 44, color: "#ab47bc", score: 32, shape: "circle" },
  { size: 55, color: "#26c6da", score: 64, shape: "circle" },
  { size: 70, color: "#ff7043", score: 128, shape: "circle" },
  { size: 89, color: "#66bb6a", score: 256, shape: "circle" },
  { size: 110, color: "#ffa726", score: 512, shape: "circle" },
  { size: 135, color: "#ec407a", score: 1024, shape: "circle" },
  { size: 165, color: "#ffca28", score: 2048, shape: "circle" },
  { size: 200, color: "#ef5350", score: 4096, shape: "circle" },
  { size: 245, color: "#7e57c2", score: 8192, shape: "circle" },
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
