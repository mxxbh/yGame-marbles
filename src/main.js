import { GameController } from "./game/GameController";
import "./styles.css";

const HIGH_SCORE_KEY = "marble-game-high-score";

window.onload = () => {
  const gameArea = document.getElementById("game-area");
  const scoreEl = document.getElementById("score");
  const highScoreText = document.getElementById("high-score-text");
  const finalScoreEl = document.getElementById("final-score");
  const nextPreview = document.getElementById("next-preview");
  const startOverlay = document.getElementById("start-overlay");
  const gameOverOverlay = document.getElementById("game-over-overlay");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  const gameController = new GameController();
  gameController.init(gameArea);

  let highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);

  const updateHighScore = (score) => {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
  };

  gameController.onGameOver = (score) => {
    finalScoreEl.textContent = score;
    updateHighScore(score);
    highScoreText.textContent = `最高: ${highScore}`;
    gameOverOverlay.classList.remove("hidden");
  };

  const updateNextPreview = () => {
    const info = gameController.getNextMarbleInfo();
    if (!info) {
      nextPreview.style.display = "none";
      return;
    }
    nextPreview.style.display = "";
    nextPreview.style.background = info.color;
    nextPreview.classList.toggle("oval", info.shape === "oval");
  };

  const startGame = () => {
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    scoreEl.textContent = "0";
    highScoreText.textContent = `最高: ${highScore}`;
    gameController.start();
    updateNextPreview();
  };

  document.addEventListener("GAME_SCORE_EVENT", (e) => {
    scoreEl.textContent = e.detail.score;
  });

  document.addEventListener("NEXT_MARBLE_EVENT", () => {
    updateNextPreview();
  });

  startBtn.addEventListener("click", startGame);

  restartBtn.addEventListener("click", () => {
    gameController.reset();
    startGame();
  });
};
