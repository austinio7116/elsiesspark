import Brush from './Brush.js';

// EraserBrush is kept for backward compatibility with old saved projects
// that may contain standalone eraser stroke objects. New eraser behavior
// works by adding eraserPaths to targeted objects instead.
export default class EraserBrush extends Brush {
  constructor() {
    super('eraser');
  }

  render(ctx, obj) {
    const pts = obj.points;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = obj.brushSize;
    ctx.strokeStyle = '#000';
    ctx.globalAlpha = 1;
    this.drawSmoothPath(ctx, pts);
  }
}
