// 本地 ESM 导入（你已安装 matter-js）
import { Engine, Render, World, Bodies, Body, Events, Runner } from "matter-js";
import { GameController } from "./game/GameController";

import "./styles.css";

window.onload = () => {
  const gameArea = document.getElementById("game-area");
  const gameController = new GameController();
  gameController.init(gameArea);
  gameController.start();
};

// document.getElementById("drop")?.onclick = () => {
//   setTimeout(() => {
//     const jellies = world.bodies.filter((b) => b.label?.startsWith("jelly"));
//     if (jellies.some((j) => j.position.y < 30)) {
//       alert(`游戏结束！分数：${score}`);
//       location.reload();
//     } else {
//       spawnJelly();
//     }
//   }, 600);
// };
