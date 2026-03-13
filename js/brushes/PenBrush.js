import Brush from './Brush.js';

export default class PenBrush extends Brush {
  constructor() {
    super('pen');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const soft = obj.softness || 0;
    const useSoft = soft > 0;

    const tgt = useSoft ? Brush.getSoftTmpCtx(ctx.canvas.width, ctx.canvas.height) : ctx;
    if (useSoft) {
      tgt.save();
      tgt.translate(obj.x, obj.y);
      tgt.rotate(obj.rotation * Math.PI / 180);
      tgt.scale(obj.scale || 1, obj.scale || 1);
    }
    tgt.lineCap = 'round';
    tgt.lineJoin = 'round';
    tgt.lineWidth = obj.brushSize;
    tgt.strokeStyle = obj.color;
    tgt.globalAlpha = opacity;
    this.drawSmoothPath(tgt, pts);
    if (useSoft) {
      tgt.restore();
      ctx.restore();
      ctx.save();
      ctx.filter = `blur(${soft * obj.brushSize * 0.4}px)`;
      ctx.drawImage(tgt.canvas, 0, 0);
      ctx.filter = 'none';
    }
  }
}
