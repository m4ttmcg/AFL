export class Field {
  private width: number;
  private height: number;
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    // Leave a small margin from canvas border
    this.rx = width / 2 - 10;
    this.ry = height / 2 - 10;
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Background
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, this.width, this.height);

    // Oval boundary
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(this.cx, this.cy, this.rx, this.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Center square (approximate 50x50m representation scaled)
    const squareSize = 160; // pixels; adjust to taste
    ctx.beginPath();
    ctx.rect(this.cx - squareSize / 2, this.cy - squareSize / 2, squareSize, squareSize);
    ctx.stroke();

    // Goal squares (approximate AFL goal squares near oval ends)
    const leftX = this.cx - this.rx + 5;
    const rightX = this.cx + this.rx - 65;
    ctx.strokeRect(leftX, this.cy - 80, 60, 160);
    ctx.strokeRect(rightX, this.cy - 80, 60, 160);

    // Goal posts at oval tips
    this.drawGoalPosts(ctx, this.cx - this.rx + 5, this.cy);
    this.drawGoalPosts(ctx, this.cx + this.rx - 5, this.cy);

    // 50m arcs (circular approximation)
    ctx.beginPath();
    ctx.arc(this.cx - this.rx + 5, this.cy, 120, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.cx + this.rx - 5, this.cy, 120, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.stroke();
  }

  private drawGoalPosts(ctx: CanvasRenderingContext2D, x: number, centerY: number) {
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;
    // Goal posts
    ctx.fillRect(x - 2, centerY - 30, 4, 8);
    ctx.fillRect(x - 2, centerY + 22, 4, 8);
    // Behind posts
    ctx.fillRect(x - 2, centerY - 55, 4, 8);
    ctx.fillRect(x - 2, centerY + 47, 4, 8);
  }

  // Geometry helpers
  public getEllipse() {
    return { cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry };
  }

  public isInside(x: number, y: number, margin = 0) {
    const rx = Math.max(1, this.rx - margin);
    const ry = Math.max(1, this.ry - margin);
    const dx = x - this.cx;
    const dy = y - this.cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }

  public projectInside(x: number, y: number, margin = 0) {
    const rx = Math.max(1, this.rx - margin);
    const ry = Math.max(1, this.ry - margin);
    const dx = x - this.cx;
    const dy = y - this.cy;
    const t = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
    if (t <= 1) return { x, y };
    const scale = 1 / t;
    return { x: this.cx + dx * scale, y: this.cy + dy * scale };
  }

  public normalAt(x: number, y: number) {
    // Normal from gradient of ellipse implicit function
    const nx = (x - this.cx) / (this.rx * this.rx);
    const ny = (y - this.cy) / (this.ry * this.ry);
    const len = Math.hypot(nx, ny) || 1;
    return { nx: nx / len, ny: ny / len };
  }
}
