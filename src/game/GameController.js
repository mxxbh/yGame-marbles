import { Engine, Render, World, Bodies, Body, Events, Runner } from "matter-js";
import { MARBLE_TYPES, MARBLE_CIRCLE_CONFIG } from "./constants.js";

const matterDefaultConfig = {
  render: {
    wireframes: false,
    background: "transparent",
  },
  marble: MARBLE_CIRCLE_CONFIG,
  staticMarble: {
    isStatic: true,
    ...MARBLE_CIRCLE_CONFIG,
  },
};

const GAME_SCORE_EVENT = "GAME_SCORE_EVENT";

export class GameController {
  _engine = null;
  _world = null;
  _sceneWidth = 0;
  _sceneHeight = 0;
  _currentMarble = null;
  _currentScore = 0;

  constructor() {}

  _initRender(canvasDOM) {
    const gameArea = canvasDOM;
    const width = gameArea.offsetWidth;
    const height = gameArea.offsetHeight;

    const engine = Engine.create();
    const render = Render.create({
      element: gameArea,
      engine: engine,
      options: { width, height, ...matterDefaultConfig.render },
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);

    this._engine = engine;
    this._world = engine.world;
    this._sceneWidth = width;
    this._sceneHeight = height;
  }

  _initScene() {
    const commonConfig = {
      isStatic: true,
      render: { visible: false },
    };
    const [width, height] = [this._sceneWidth, this._sceneHeight];
    const ground = Bodies.rectangle(width / 2, height + 10, width, 20, commonConfig);
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height, commonConfig);
    const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, commonConfig);

    World.add(this._world, [ground, leftWall, rightWall]);
  }

  _dispatchScoreUpdateEvent() {
    document.dispatchEvent(
      new CustomEvent(GAME_SCORE_EVENT, {
        detail: {
          score: this._currentScore,
        },
      }),
    );
  }

  _createMarble(x, y, level, size, isStatic = false) {
    const { size: defaultSize, color } = MARBLE_TYPES[level];
    const marble = Bodies.circle(x, y, size ?? defaultSize, {
      ...matterDefaultConfig.marble,
      ...(isStatic ? matterDefaultConfig.staticMarble : {}),
      label: `marble_${level}`,
      render: { fillStyle: color },
    });
    return marble;
  }

  _createStaticMarble(x, y, level, size) {
    return this._createMarble(x, y, level, size, true);
  }

  /**
   * 绑定碰撞事件，实现弹珠合并动画。
   */
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
        const { size: newSize, color: newColor, score } = MARBLE_TYPES[newLevel];

        // 缩小动画
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

            // 新水母放大
            const x = (a.position.x + b.position.x) / 2;
            const y = (a.position.y + b.position.y) / 2;
            const newMarble = this._createMarble(x, y, newLevel, 1);
            World.add(this._world, newMarble);

            let g = 0.01;
            const grow = setInterval(() => {
              g += newSize / 20;
              if (g >= newSize) g = newSize;
              Body.scale(newMarble, g / newMarble.circleRadius, g / newMarble.circleRadius);
              if (g >= newSize) clearInterval(grow);
            }, 10);

            this._currentScore += score;
            this._dispatchScoreUpdateEvent();
          }
        }, 10);
      }
    });
  }

  /**
   * 初始化游戏。
   */
  init(canvasDOM) {
    if (canvasDOM == null || !(canvasDOM instanceof HTMLElement)) {
      throw new Error("Canvas DOM element is required to initialize the game.");
    }

    this._initRender(canvasDOM);
    this._initScene();
    this._bindCollision();
  }

  createMarble() {
    const level = 0;
    const marble = this._createStaticMarble(this._sceneWidth / 2, 40, level);
    World.add(this._world, marble);
    this._currentMarble = marble;
  }
}
