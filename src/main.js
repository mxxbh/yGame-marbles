import { GameEngine } from './game/GameEngine.js';
import { MarbleRenderer } from './game/MarbleRenderer.js';
import { GAME_CONFIG } from './game/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameCanvas = document.getElementById('gameCanvas');
  const currentCanvas = document.getElementById('currentCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const scoreElement = document.getElementById('score');
  const finalScoreElement = document.getElementById('finalScore');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const restartBtn = document.getElementById('restartBtn');
  const glassContainer = document.querySelector('.glass-container');
  
  const canvasWidth = GAME_CONFIG.glassWidth + GAME_CONFIG.glassLeft * 2;
  const canvasHeight = GAME_CONFIG.glassHeight + GAME_CONFIG.glassTop;
  
  gameCanvas.width = canvasWidth;
  gameCanvas.height = canvasHeight;
  
  const gameEngine = new GameEngine(gameCanvas);
  
  const currentRenderer = new MarbleRenderer(currentCanvas);
  const nextRenderer = new MarbleRenderer(nextCanvas);
  
  gameEngine.scoreCallback = (score) => {
    scoreElement.textContent = score;
  };
  
  gameEngine.nextMarbleCallback = (typeIndex) => {
    nextRenderer.clear(60, 60);
    nextRenderer.drawMarble(30, 30, typeIndex, 1.2);
  };
  
  gameEngine.gameOverCallback = (score) => {
    finalScoreElement.textContent = score;
    gameOverOverlay.style.display = 'flex';
  };
  
  function updateCurrentMarble() {
    currentRenderer.clear(60, 60);
    currentRenderer.drawMarble(30, 30, gameEngine.getCurrentType(), 1.2);
  }
  
  updateCurrentMarble();
  gameEngine.nextMarbleCallback(gameEngine.nextType);
  
  glassContainer.addEventListener('mousemove', (e) => {
    if (gameEngine.gameOver) return;
    
    const rect = glassContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    gameEngine.setCurrentX(x);
    
    const currentMarbleSize = 60;
    const maxLeft = glassContainer.offsetWidth - currentMarbleSize;
    const left = Math.max(0, Math.min(maxLeft, gameEngine.currentX - GAME_CONFIG.glassLeft - currentMarbleSize / 2));
    currentCanvas.style.left = (left + 40) + 'px';
  });
  
  glassContainer.addEventListener('click', () => {
    if (!gameEngine.gameOver) {
      gameEngine.dropMarble();
      updateCurrentMarble();
    }
  });
  
  restartBtn.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    gameEngine.reset();
    updateCurrentMarble();
  });
  
  function gameLoop() {
    if (!gameEngine.gameOver) {
      gameEngine.update();
    }
    gameEngine.render();
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
});