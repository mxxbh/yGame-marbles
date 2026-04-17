import { MARBLE_TYPES } from './constants.js';

export class Marble {
  constructor(engine, x, y, typeIndex) {
    this.engine = engine;
    this.typeIndex = typeIndex;
    this.type = MARBLE_TYPES[typeIndex];
    
    const radius = this.type.size;
    
    this.body = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.6,
      friction: 0.01,
      frictionAir: 0.001,
      density: 0.001,
      render: {
        visible: false
      },
      label: `marble_${typeIndex}_${Date.now()}`
    });
    
    this.body.marble = this;
    
    Matter.Composite.add(engine.world, this.body);
  }
  
  get x() {
    return this.body.position.x;
  }
  
  get y() {
    return this.body.position.y;
  }
  
  get radius() {
    return this.type.size;
  }
  
  remove() {
    Matter.Composite.remove(this.engine.world, this.body);
  }
  
  isNear(other, threshold = 0.8) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.radius + other.radius) * threshold;
    return distance < minDistance;
  }
  
  canMergeWith(other) {
    return this.typeIndex === other.typeIndex && 
           this.typeIndex < MARBLE_TYPES.length - 1 &&
           this.isNear(other);
  }
  
  mergeWith(other) {
    const newTypeIndex = this.typeIndex + 1;
    const newX = (this.x + other.x) / 2;
    const newY = (this.y + other.y) / 2;
    
    this.remove();
    other.remove();
    
    return new Marble(this.engine, newX, newY, newTypeIndex);
  }
}