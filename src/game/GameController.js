import { Engine, Render, World, Bodies, Body, Events, Runner } from "matter-js";
import { MARBLE_TYPES, MARBLE_CIRCLE_CONFIG } from "./constants.js";
import { playMergeSound, playDropSound } from "./sound.js";

const matterDefaultConfig = {
  render: {
    wireframes: false,
    background: "transparent",
  },
  bottle: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 120,
    paddingBottom: 20,
    backgroundColor: "#53a3ff",
  },
  marble: MARBLE_CIRCLE_CONFIG,
  staticMarble: {
    ...MARBLE_CIRCLE_CONFIG,
    isStatic: true,
    collisionFilter: { mask: 0x0000 },
  },
};

const GAME_SCORE_EVENT = "GAME_SCORE_EVENT";
const GAME_OVER_LINE_Y = 120;
const GAME_OVER_GRACE_MS = 2000;
const MARBLE_CREATE_COOLDOWN = 1000;
const MAX_RANDOM_LEVEL = 2;

export class GameController {
  _gameArea = null;
  _engine = null;
  _world = null;
  _sceneWidth = 0;
  _sceneHeight = 0;
  _currentMarble = null;
  _currentMarbleLevel = 0;
  _currentScore = 0;
  _marblePositionX = 0;
  _marblePositionY = 80;
  _nextMarble = null;
  _gameOver = false;
  _gameStarted = false;
  _onGameOver = null;
  _lastDropTime = 0;
  _lastCreateTime = 0;

  constructor() {}

  _initRender(canvasDOM) {
    const gameArea = canvasDOM;
    const width = gameArea.offsetWidth;
    const height = gameArea.offsetHeight;

    const engine = Engine.create({ gravity: { y: 1 } });
    const render = Render.create({
      element: gameArea,
      engine: engine,
      options: { width, height, ...matterDefaultConfig.render },
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);

    this._gameArea = gameArea;
    this._engine = engine;
    this._world = engine.world;
    this._sceneWidth = width;
    this._sceneHeight = height;
  }

  _initScene() {
    const commonConfig = {
      isStatic: true,
      render: { visible: true, fillStyle: matterDefaultConfig.bottle.backgroundColor },
    };
    const { paddingLeft, paddingRight, paddingTop, paddingBottom } = matterDefaultConfig.bottle;
    const [width, height] = [this._sceneWidth, this._sceneHeight - paddingTop];
    const ground = Bodies.rectangle(width / 2, paddingTop + height - paddingBottom / 2, width, paddingBottom, commonConfig);
    const leftWall = Bodies.rectangle(paddingLeft / 2, paddingTop + height / 2, paddingLeft, height, commonConfig);
    const rightWall = Bodies.rectangle(width - paddingRight / 2, paddingTop + height / 2, paddingRight, height, commonConfig);
    const gameOverLine = Bodies.rectangle(width / 2, GAME_OVER_LINE_Y, width, 2, {
      isStatic: true,
      render: { fillStyle: "rgba(255, 80, 80, 0.5)" },
      label: "game-over-line",
      collisionFilter: { mask: 0x0000 },
    });

    World.add(this._world, [ground, leftWall, rightWall, gameOverLine]);
  }

  _dispatchScoreUpdateEvent() {
    document.dispatchEvent(
      new CustomEvent(GAME_SCORE_EVENT, {
        detail: { score: this._currentScore },
      }),
    );
  }

  _createMarble(x, y, level, size, isStatic = false) {
    const { size: defaultSize, color, shape } = MARBLE_TYPES[level];
    const actualSize = size ?? defaultSize;
    const marble = Bodies.circle(x, y, actualSize, {
      ...matterDefaultConfig.marble,
      ...(isStatic ? matterDefaultConfig.staticMarble : {}),
      label: `marble_${level}`,
      render: { fillStyle: color },
    });

    if (shape === "oval") {
      Body.scale(marble, 1.08, 0.92);
    }

    World.add(this._world, marble);
    return marble;
  }

  _createStaticMarble(x, y, level, size) {
    return this._createMarble(x, y, level, size, true);
  }

  _getMarbleEffectiveWidth(level) {
    const { size, shape } = MARBLE_TYPES[level];
    return shape === "oval" ? size * 1.08 : size;
  }

  _calcPositionX(movementX) {
    const { paddingLeft, paddingRight } = matterDefaultConfig.bottle;
    const effectiveRadius = this._getMarbleEffectiveWidth(this._currentMarbleLevel);
    const min = effectiveRadius + paddingLeft;
    const max = this._sceneWidth - effectiveRadius - paddingRight;
    this._marblePositionX = Math.max(Math.min(this._marblePositionX + movementX, max), min);
  }

  _updateMarblePosition(movementX) {
    if (!this._currentMarble) return;
    this._calcPositionX(movementX);
    Body.setPosition(this._currentMarble, {
      x: this._marblePositionX,
      y: this._marblePositionY,
    });
  }

  _bindCollision() {
    const merging = new Set();
    Events.on(this._engine, "collisionStart", (e) => {
      for (const pair of e.pairs) {
        const a = pair.bodyA;
        const b = pair.bodyB;

        if (!a.label || !b.label) continue;
        if (!a.label.includes("marble") || !b.label.includes("marble")) continue;
        if (a.label !== b.label) continue;
        if (merging.has(a) || merging.has(b)) continue;

        const level = parseInt(a.label.split("_")[1]);
        if (level >= MARBLE_TYPES.length - 1) continue;

        merging.add(a);
        merging.add(b);
        const newLevel = level + 1;
        const { size: newSize, score } = MARBLE_TYPES[newLevel];

        let scale = 1;
        const shrink = setInterval(() => {
          scale -= 0.06;
          if (scale <= 0) scale = 0;
          Body.scale(a, scale, scale);
          Body.scale(b, scale, scale);

          if (scale <= 0) {
            clearInterval(shrink);
            World.remove(this._world, [a, b]);
            merging.delete(a);
            merging.delete(b);

            const x = (a.position.x + b.position.x) / 2;
            const y = (a.position.y + b.position.y) / 2;
            this._createMarble(x, y, newLevel, newSize);

            this._currentScore += score;
            this._dispatchScoreUpdateEvent();
            playMergeSound(newLevel);
          }
        }, 10);
      }
    });
  }

  _fallMarble() {
    if (!this._currentMarble) return;
    World.remove(this._world, this._currentMarble);
    this._currentMarble = null;
    this._lastDropTime = Date.now();
    playDropSound();
    this._createMarble(this._marblePositionX, this._marblePositionY, this._currentMarbleLevel);
  }

  _bindTouch() {
    let masterPointerId = NaN;
    this._gameArea.addEventListener("pointerdown", (e) => {
      if (!this._gameStarted || this._gameOver) return;
      if (this._currentMarble) return;
      if (Date.now() - this._lastCreateTime < MARBLE_CREATE_COOLDOWN) return;

      const rect = this._gameArea.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const level = this._nextMarble?.level ?? 0;
      const { paddingLeft, paddingRight } = matterDefaultConfig.bottle;
      const effectiveRadius = this._getMarbleEffectiveWidth(level);
      const min = effectiveRadius + paddingLeft;
      const max = this._sceneWidth - effectiveRadius - paddingRight;
      this._marblePositionX = Math.max(Math.min(rawX, max), min);

      const { pointerId = 1 } = e ?? {};
      masterPointerId = pointerId;

      this.createMarble();
    });

    this._gameArea.addEventListener("pointermove", (e) => {
      if (!this._gameStarted || this._gameOver) return;
      const { movementX = 0, pointerId = 1 } = e ?? {};
      if (!this._currentMarble || masterPointerId !== pointerId) return;
      this._updateMarblePosition(movementX);
    });

    const handleTouchEnd = () => {
      masterPointerId = NaN;
      this._fallMarble();
    };
    this._gameArea.addEventListener("pointerup", (e) => {
      const { pointerId = 1 } = e ?? {};
      if (!this._currentMarble || masterPointerId !== pointerId) return;
      handleTouchEnd();
    });
    this._gameArea.addEventListener("pointerleave", (e) => {
      const { pointerId = 1 } = e ?? {};
      if (!this._currentMarble || masterPointerId !== pointerId) return;
      handleTouchEnd();
    });
  }

  _initGameOverDetection() {
    let frameCount = 0;
    Events.on(this._engine, "afterUpdate", () => {
      if (!this._gameStarted || this._gameOver) return;
      frameCount++;
      if (frameCount % 30 !== 0) return;

      if (Date.now() - this._lastDropTime < GAME_OVER_GRACE_MS) return;

      const marbles = this._world.bodies.filter((b) => b.label?.startsWith("marble_") && !b.isStatic);
      for (const m of marbles) {
        if (m.position.y < GAME_OVER_LINE_Y) {
          this._gameOver = true;
          if (this._onGameOver) {
            this._onGameOver(this._currentScore);
          }
          break;
        }
      }
    });
  }

  _randomLevel() {
    return Math.floor(Math.random() * (MAX_RANDOM_LEVEL + 1));
  }

  /**
   * 返回下一颗弹珠的预览信息。
   */
  getNextMarbleInfo() {
    if (!this._nextMarble) return null;
    const { size, color, shape } = MARBLE_TYPES[this._nextMarble.level];
    return { level: this._nextMarble.level, size, color, shape };
  }

  /**
   * 设置游戏结束回调。
   */
  set onGameOver(cb) {
    this._onGameOver = cb;
  }

  init(canvasDOM) {
    if (canvasDOM == null || !(canvasDOM instanceof HTMLElement)) {
      throw new Error("Canvas DOM element is required to initialize the game.");
    }

    this._initRender(canvasDOM);
    this._initScene();
    this._bindCollision();
    this._bindTouch();
    this._initGameOverDetection();
  }

  createMarble() {
    if (this._gameOver) return;

    this._lastCreateTime = Date.now();

    let level;
    if (this._nextMarble) {
      level = this._nextMarble.level;
    } else {
      level = this._randomLevel();
    }

    const positionX = this._marblePositionX;
    const marble = this._createStaticMarble(positionX, this._marblePositionY, level);
    this._currentMarble = marble;
    this._marblePositionX = positionX;
    this._currentMarbleLevel = level;

    this._nextMarble = { level: this._randomLevel() };

    document.dispatchEvent(new CustomEvent("NEXT_MARBLE_EVENT"));
  }

  start() {
    this._gameStarted = true;
    this._gameOver = false;
    this._nextMarble = { level: this._randomLevel() };
  }

  reset() {
    this._gameOver = false;
    this._gameStarted = false;
    this._currentScore = 0;
    this._currentMarble = null;
    this._nextMarble = null;
    this._lastDropTime = 0;
    this._lastCreateTime = 0;

    const marbles = this._world.bodies.filter((b) => b.label?.startsWith("marble_"));
    World.remove(this._world, marbles);

    this._dispatchScoreUpdateEvent();
  }
}
