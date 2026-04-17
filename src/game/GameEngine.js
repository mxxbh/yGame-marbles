import * as Matter from 'matter-js';
import { Marble } from './Marble.js';
import { MarbleRenderer } from './MarbleRenderer.js';
import { MARBLE_TYPES, SCORE_MAP, GAME_CONFIG } from './constants.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: GAME_CONFIG.gravity }
    });
    
    this.renderer = new MarbleRenderer(canvas);
    
    this.marbles = [];
    this.score = 0;
    this.currentType = this.getRandomType();
    this.nextType = this.getRandomType();
    this.gameOver = false;
    this.currentX = GAME_CONFIG.spoutX;
    
    this.initWalls();
    this.setupCollisionDetection();
    
    this.lastMergeCheck = 0;
    this.mergeCooldown = 500;
    
    this.scoreCallback = null;
    this.nextMarbleCallback = null;
    this.gameOverCallback = null;
  }
  
  initWalls() {
    const { glassWidth, glassHeight, glassLeft, glassTop } = GAME_CONFIG;
    
    const wallOptions = {
      isStatic: true,
      render: { visible: false }
    };
    
    this.leftWall = Matter.Bodies.rectangle(
      glassLeft, glassTop + glassHeight / 2,
      10, glassHeight, wallOptions
    );
    
    this.rightWall = Matter.Bodies.rectangle(
      glassLeft + glassWidth, glassTop + glassHeight / 2,
      10, glassHeight, wallOptions
    );
    
    this.bottomWall = Matter.Bodies.rectangle(
      glassLeft + glassWidth / 2, glassTop + glassHeight,
      glassWidth, 10, wallOptions
    );
    
    Matter.Composite.add(this.engine.world, [
      this.leftWall,
      this.rightWall,
      this.bottomWall
    ]);
  }
  
  setupCollisionDetection() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        if (bodyA.marble && bodyB.marble) {
          this.checkMerge(bodyA.marble, bodyB.marble);
        }
      });
    });
  }
  
  getRandomType() {
    const rand = Math.random();
    if (rand < 0.35) return 0;
    if (rand < 0.65) return 1;
    if (rand < 0.85) return 2;
    if (rand < 0.95) return 3;
    return 4;
  }
  
  dropMarble() {
    if (this.gameOver) return;
    
    const marble = new Marble(
      this.engine,
      this.currentX,
      GAME_CONFIG.spoutY,
      this.currentType
    );
    
    this.marbles.push(marble);
    
    this.currentType = this.nextType;
    this.nextType = this.getRandomType();
    
    if (this.nextMarbleCallback) {
      this.nextMarbleCallback(this.nextType);
    }
    
    this.checkGameOver();
  }
  
  checkMerge(marble1, marble2) {
    const now = Date.now();
    if (now - this.lastMergeCheck < this.mergeCooldown) return;
    
    if (marble1.canMergeWith(marble2)) {
      const newMarble = marble1.mergeWith(marble2);
      
      const index1 = this.marbles.indexOf(marble1);
      const index2 = this.marbles.indexOf(marble2);
      
      if (index1 !== -1) this.marbles.splice(index1, 1);
      if (index2 !== -1) this.marbles.splice(index2, 1);
      
      this.marbles.push(newMarble);
      
      this.score += SCORE_MAP[newMarble.typeIndex];
      if (this.scoreCallback) {
        this.scoreCallback(this.score);
      }
      
      this.lastMergeCheck = now;
      
      setTimeout(() => {
        this.checkDelayedMerges();
      }, 300);
    }
  }
  
  checkDelayedMerges() {
    for (let i = 0; i < this.marbles.length; i++) {
      for (let j = i + 1; j < this.marbles.length; j++) {
        if (this.marbles[i].canMergeWith(this.marbles[j])) {
          this.checkMerge(this.marbles[i], this.marbles[j]);
          return;
        }
      }
    }
  }
  
  checkGameOver() {
    const spoutY = GAME_CONFIG.spoutY;
    
    for (const marble of this.marbles) {
      if (marble.y - marble.radius < spoutY + 30) {
        this.gameOver = true;
        if (this.gameOverCallback) {
          this.gameOverCallback(this.score);
        }
        break;
      }
    }
  }
  
  setCurrentX(x) {
    const { glassWidth, glassLeft } = GAME_CONFIG;
    const minX = glassLeft + MARBLE_TYPES[this.currentType].size;
    const maxX = glassLeft + glassWidth - MARBLE_TYPES[this.currentType].size;
    this.currentX = Math.max(minX, Math.min(maxX, x));
  }
  
  update() {
    Matter.Engine.update(this.engine, 16.67);
    
    this.checkDelayedMerges();
    this.checkGameOver();
  }
  
  render() {
    this.renderer.clear(this.width, this.height);
    
    for (const marble of this.marbles) {
      this.renderer.drawMarble(marble.x, marble.y, marble.typeIndex);
    }
  }
  
  reset() {
    this.marbles.forEach(marble => marble.remove());
    this.marbles = [];
    this.score = 0;
    this.gameOver = false;
    this.currentType = this.getRandomType();
    this.nextType = this.getRandomType();
    this.currentX = GAME_CONFIG.spoutX;
    
    if (this.scoreCallback) this.scoreCallback(0);
    if (this.nextMarbleCallback) this.nextMarbleCallback(this.nextType);
  }
  
  getCurrentType() {
    return this.currentType;
  }
}