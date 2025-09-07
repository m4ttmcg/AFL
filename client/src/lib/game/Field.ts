export class Field {
  private width: number;
  private height: number;
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;
  private pxPerM: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    // Leave a small margin from canvas border
    this.rx = width / 2 - 10;
    this.ry = height / 2 - 10;
    // Approximate AFL ground: 160m x 130m playing area (mid-range)
    const mLength = 160;
    const mWidth = 130;
    this.pxPerM = Math.min((this.rx * 2) / mLength, (this.ry * 2) / mWidth);
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

    // Centre circles (AFL ~5m and ~10m radius)
    const r5 = this.px(5);
    const r10 = this.px(10);
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, r10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, r5, 0, Math.PI * 2);
    ctx.stroke();

    // Center square (approximate 50x50m representation scaled)
    const squareSize = this.px(50);
    ctx.beginPath();
    ctx.rect(this.cx - squareSize / 2, this.cy - squareSize / 2, squareSize, squareSize);
    ctx.stroke();

    // Goal squares (AFL ~9m depth x 6.4m width)
    const goalInset = 5; // px from boundary for drawing alignment
    const goalDepth = this.px(9);
    const goalWidth = this.px(6.4);
    const leftGoalX = this.cx - this.rx + goalInset;
    const rightGoalX = this.cx + this.rx - goalInset - goalDepth;
    ctx.strokeRect(leftGoalX, this.cy - goalWidth / 2, goalDepth, goalWidth);
    ctx.strokeRect(rightGoalX, this.cy - goalWidth / 2, goalDepth, goalWidth);

    // Goal posts at oval tips
    this.drawGoalPosts(ctx, this.cx - this.rx + goalInset, this.cy);
    this.drawGoalPosts(ctx, this.cx + this.rx - goalInset, this.cy);

    // 50m arcs (trim at oval boundary intersection)
    const r50 = this.px(50);
    const leftCenterX = this.cx - this.rx + goalInset;
    const rightCenterX = this.cx + this.rx - goalInset;
    const [lStart, lEnd] = this.goalArcAngles(leftCenterX, r50);
    const [rStart, rEnd] = this.goalArcAngles(rightCenterX, r50);
    ctx.beginPath();
    ctx.arc(leftCenterX, this.cy, r50, lStart, lEnd);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightCenterX, this.cy, r50, rStart, rEnd);
    ctx.stroke();

    // Small tick marks at arc endpoints
    this.drawArcTick(ctx, leftCenterX, this.cy, r50, lStart);
    this.drawArcTick(ctx, leftCenterX, this.cy, r50, lEnd);
    this.drawArcTick(ctx, rightCenterX, this.cy, r50, rStart);
    this.drawArcTick(ctx, rightCenterX, this.cy, r50, rEnd);
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

  private px(meters: number) {
    return meters * this.pxPerM;
  }

  // Compute arc start/end angles (in radians) for a goal arc centered at gx, radius r,
  // trimmed to where the circle intersects the oval boundary. Symmetric around axis.
  private goalArcAngles(gx: number, r: number): [number, number] {
    const dx = gx - this.cx; // horizontal offset from ellipse center
    const invRx2 = 1 / (this.rx * this.rx);
    const invRy2 = 1 / (this.ry * this.ry);
    const a = r * r * (invRx2 - invRy2);
    const b = 2 * dx * r * invRx2;
    const c = r * r * invRy2 + (dx * dx) * invRx2 - 1;
    let theta = Math.PI / 2; // default half-arc if degeneracy
    const eps = 1e-6;
    if (Math.abs(a) < eps) {
      // Near-circular ellipse or extremely small difference; fallback to half-arc
      theta = Math.PI / 2;
    } else {
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc);
        const u1 = (-b + sqrtDisc) / (2 * a); // candidate cos(t)
        const u2 = (-b - sqrtDisc) / (2 * a);
        const clamp = (u: number) => Math.max(-1, Math.min(1, u));
        const cu1 = clamp(u1);
        const cu2 = clamp(u2);
        // Choose the valid cosine producing the smaller angle (larger cosine)
        const cu = Math.max(cu1, cu2);
        theta = Math.acos(cu);
        if (!isFinite(theta) || theta <= 0) theta = Math.PI / 2;
      }
    }
    // Left side centers are negative dx, arc around angle 0; Right side around pi
    if (dx < 0) {
      return [-theta, theta];
    } else {
      return [Math.PI - theta, Math.PI + theta];
    }
  }

  private drawArcTick(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number) {
    const len = 10; // px tick length
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    // Tangent vector on circle at angle
    const tx = -Math.sin(angle);
    const ty = Math.cos(angle);
    ctx.beginPath();
    ctx.moveTo(px - (tx * len) / 2, py - (ty * len) / 2);
    ctx.lineTo(px + (tx * len) / 2, py + (ty * len) / 2);
    ctx.stroke();
  }
}
