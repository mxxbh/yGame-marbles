import { MARBLE_TYPES } from './constants.js';

export class MarbleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  drawMarble(x, y, typeIndex, scale = 1) {
    const type = MARBLE_TYPES[typeIndex];
    const radius = type.size * scale;
    
    this.ctx.save();
    
    const gradient = this.ctx.createRadialGradient(
      x - radius * 0.2, y - radius * 0.2, 0,
      x, y, radius
    );
    gradient.addColorStop(0, this.lightenColor(type.color, 40));
    gradient.addColorStop(0.5, type.color);
    gradient.addColorStop(1, this.darkenColor(type.color, 30));
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fill();
    
    this.drawPattern(x, y, radius, type.pattern, type.color);
    
    this.ctx.restore();
  }

  drawPattern(x, y, radius, pattern, color) {
    this.ctx.save();
    this.ctx.translate(x, y);
    
    switch(pattern) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.lightenColor(color, 50);
        this.ctx.fill();
        break;
        
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius * 0.3);
        this.ctx.lineTo(radius * 0.3, radius * 0.2);
        this.ctx.lineTo(-radius * 0.3, radius * 0.2);
        this.ctx.closePath();
        this.ctx.fillStyle = this.lightenColor(color, 40);
        this.ctx.fill();
        break;
        
      case 'diamond':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius * 0.3);
        this.ctx.lineTo(radius * 0.3, 0);
        this.ctx.lineTo(0, radius * 0.3);
        this.ctx.lineTo(-radius * 0.3, 0);
        this.ctx.closePath();
        this.ctx.fillStyle = this.lightenColor(color, 40);
        this.ctx.fill();
        break;
        
      case 'star':
        this.drawStar(0, 0, 5, radius * 0.3, radius * 0.15);
        this.ctx.fillStyle = this.lightenColor(color, 50);
        this.ctx.fill();
        break;
        
      case 'flower':
        for (let i = 0; i < 6; i++) {
          this.ctx.beginPath();
          this.ctx.arc(
            Math.cos(i * Math.PI / 3) * radius * 0.2,
            Math.sin(i * Math.PI / 3) * radius * 0.2,
            radius * 0.1, 0, Math.PI * 2
          );
          this.ctx.fillStyle = this.lightenColor(color, 50);
          this.ctx.fill();
        }
        break;
        
      case 'sun':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff9c4';
        this.ctx.fill();
        break;
        
      case 'moon':
        this.ctx.beginPath();
        this.ctx.ellipse(-radius * 0.1, -radius * 0.1, radius * 0.25, radius * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = this.lightenColor(color, 60);
        this.ctx.fill();
        break;
        
      case 'planet':
        const planetGradient = this.ctx.createRadialGradient(
          radius * 0.2, radius * 0.2, 0,
          0, 0, radius * 0.4
        );
        planetGradient.addColorStop(0, this.lightenColor(color, 30));
        planetGradient.addColorStop(1, this.darkenColor(color, 20));
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = planetGradient;
        this.ctx.fill();
        break;
    }
    
    this.ctx.restore();
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) - amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) - amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) - amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  clear(width, height) {
    this.ctx.clearRect(0, 0, width, height);
  }
}