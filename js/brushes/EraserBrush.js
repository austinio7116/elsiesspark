import Brush from './Brush.js';

export default class EraserBrush extends Brush {
  constructor() {
    super('eraser');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = obj.brushSize;
    ctx.strokeStyle = '#000';
    ctx.globalAlpha = opacity;
    this.drawSmoothPath(ctx, pts);
  }
}
