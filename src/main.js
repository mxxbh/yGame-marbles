// 本地 ESM 导入（你已安装 matter-js）
import { Engine, Render, World, Bodies, Body, Events, Runner } from "matter-js";
import "./styles.css";
import { GameController } from "./game/GameController";

// ====================
// 游戏基础配置
// ====================
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const width = gameArea.offsetWidth;
const height = gameArea.offsetHeight;

let engine, world;
let score = 0;
let currentJelly = null;
let currentLevel = 0;

const jellyLevels = [
  { size: 20, color: "#e3f2fd", score: 1 },
  { size: 30, color: "", score: 2 },
  { size: 40, color: "#90caf9", score: 4 },
  { size: 50, color: "#64b5f6", score: 8 },
  { size: 60, color: "#42a5f5", score: 16 },
];

// ====================
// 初始化游戏
// ====================
function init() {
  const gameController = new GameController();
  gameController.init(gameArea);
  gameController.createMarble();
}

// ====================
// 生成水母（Matter 0.20 稳定版）
// ====================
function spawnJelly() {
  const { size, color } = jellyLevels[currentLevel];

  currentJelly = Bodies.circle(width / 2, 40, size, {
    isStatic: true,
    restitution: 0.5,
    friction: 0.4,
    label: `jelly_${currentLevel}`,
    render: { fillStyle: color },
  });

  World.add(world, currentJelly);
}

// ====================
// 控制按钮
// ====================
document.getElementById("left").onclick = () => {
  if (!currentJelly) return;
  Body.setPosition(currentJelly, {
    x: currentJelly.position.x - 30,
    y: currentJelly.position.y,
  });
  Body.setVelocity(currentJelly, { x: 0, y: 0 });
};

document.getElementById("right").onclick = () => {
  if (!currentJelly) return;
  Body.setPosition(currentJelly, {
    x: currentJelly.position.x + 30,
    y: currentJelly.position.y,
  });
  Body.setVelocity(currentJelly, { x: 0, y: 0 });
};

document.getElementById("drop").onclick = () => {
  if (!currentJelly) return;

  // Matter 0.20 修复：解开惯性即可掉落
  Body.setInertia(currentJelly, 1);
  World.remove(world, currentJelly);

  const { size, color } = jellyLevels[currentLevel];

  currentJelly = Bodies.circle(width / 2, 40, size, {
    isStatic: false,
    restitution: 0.5,
    friction: 0.4,
    label: `jelly_${currentLevel}`,
    render: { fillStyle: color },
  });

  World.add(world, currentJelly);
  currentJelly = null;

  setTimeout(() => {
    const jellies = world.bodies.filter((b) => b.label?.startsWith("jelly"));
    if (jellies.some((j) => j.position.y < 30)) {
      alert(`游戏结束！分数：${score}`);
      location.reload();
    } else {
      spawnJelly();
    }
  }, 600);
};

// 启动
window.onload = init;
