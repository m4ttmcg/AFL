export class Field {
  private width: number;
  private height: number;
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;
  private pxPerM: number;
  private goalInsetPx: number;
  private postSpreadFactor: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    // Leave a small margin from canvas border
    this.rx = width / 2 - 10;
    this.ry = height / 2 - 10;
    this.goalInsetPx = 5;
    this.postSpreadFactor = 1.5; // visually spread posts slightly wider
    // Approximate AFL ground: 160m x 130m playing area (mid-range)
    const mLength = 160;
    const mWidth = 130;
    this.pxPerM = Math.min((this.rx * 2) / mLength, (this.ry * 2) / mWidth);
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Background
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grass stripes clipped to oval
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(this.cx, this.cy, this.rx, this.ry, 0, 0, Math.PI * 2);
    ctx.clip();
    const stripeH = 40;
    for (let y = this.cy - this.ry; y < this.cy + this.ry; y += stripeH) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(this.cx - this.rx, y, this.rx * 2, stripeH / 2);
    }
    ctx.restore();

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
    // Center square hash marks (short ticks at midpoints)
    const hashLen = 12;
    ctx.beginPath();
    // Top midpoint tick (pointing outward)
    ctx.moveTo(this.cx - hashLen / 2, this.cy - squareSize / 2);
    ctx.lineTo(this.cx + hashLen / 2, this.cy - squareSize / 2);
    // Bottom midpoint
    ctx.moveTo(this.cx - hashLen / 2, this.cy + squareSize / 2);
    ctx.lineTo(this.cx + hashLen / 2, this.cy + squareSize / 2);
    // Left midpoint (vertical tick)
    ctx.moveTo(this.cx - squareSize / 2, this.cy - hashLen / 2);
    ctx.lineTo(this.cx - squareSize / 2, this.cy + hashLen / 2);
    // Right midpoint
    ctx.moveTo(this.cx + squareSize / 2, this.cy - hashLen / 2);
    ctx.lineTo(this.cx + squareSize / 2, this.cy + hashLen / 2);
    ctx.stroke();

    // Goal squares (AFL ~9m depth x 6.4m width)
    const goalInset = this.goalInsetPx; // px from boundary for drawing alignment
    const goalDepth = this.px(9);
    const goalWidth = this.px(6.4 * this.postSpreadFactor);
    const leftGoalX = this.cx - this.rx + goalInset;
    const rightGoalX = this.cx + this.rx - goalInset - goalDepth;
    ctx.strokeRect(leftGoalX, this.cy - goalWidth / 2, goalDepth, goalWidth);
    ctx.strokeRect(rightGoalX, this.cy - goalWidth / 2, goalDepth, goalWidth);

    // Scoring tints (light overlays): goal window (greenish), behind windows (yellowish)
    const areas = this.getGoalAreas();
    const tintDepth = this.px(6); // depth into field
    ctx.save();
    ctx.globalAlpha = 0.15;
    // Left goal tint
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(leftGoalX, areas.left.yGoalTop, tintDepth, areas.left.yGoalBottom - areas.left.yGoalTop);
    // Left behind tints
    ctx.fillStyle = '#ffd000';
    ctx.fillRect(leftGoalX, areas.left.yBehindTop, tintDepth, areas.left.yGoalTop - areas.left.yBehindTop);
    ctx.fillRect(leftGoalX, areas.left.yGoalBottom, tintDepth, areas.left.yBehindBottom - areas.left.yGoalBottom);
    // Right goal tint
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(this.cx + this.rx - goalInset - tintDepth, areas.right.yGoalTop, tintDepth, areas.right.yGoalBottom - areas.right.yGoalTop);
    // Right behind tints
    ctx.fillStyle = '#ffd000';
    ctx.fillRect(this.cx + this.rx - goalInset - tintDepth, areas.right.yBehindTop, tintDepth, areas.right.yGoalTop - areas.right.yBehindTop);
    ctx.fillRect(this.cx + this.rx - goalInset - tintDepth, areas.right.yGoalBottom, tintDepth, areas.right.yBehindBottom - areas.right.yGoalBottom);
    ctx.restore();

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
    // Distances in meters
    const halfGoal = 3.2 * this.postSpreadFactor; // half of 6.4m (visually exaggerated)
    const behindOffset = 6.4 * this.postSpreadFactor; // distance from goal post to behind post

    // Convert to pixels
    const yGoalTop = centerY - this.px(halfGoal);
    const yGoalBottom = centerY + this.px(halfGoal);
    const yBehindTop = centerY - this.px(halfGoal + behindOffset);
    const yBehindBottom = centerY + this.px(halfGoal + behindOffset);

    // Visual sizes (screen-space aesthetics)
    const goalThickness = 5;
    const behindThickness = 3;
    const goalHeight = 34;
    const behindHeight = 22;

    // Slight perspective: lean posts toward oval center
    const lean = x < this.cx ? 4 : -4; // px offset at the top

    const drawPost = (px: number, cy: number, height: number, thickness: number) => {
      const halfH = height / 2;
      const x0 = px - thickness / 2;
      const x1 = px + thickness / 2;
      const y0 = cy - halfH;
      const y1 = cy + halfH;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y0);
      ctx.lineTo(x1 + (lean * thickness) / goalThickness, y1);
      ctx.lineTo(x0 + (lean * thickness) / goalThickness, y1);
      ctx.closePath();
      ctx.fill();

      // Shadow at base
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px + lean * 0.4, y1 + 2, thickness * 1.2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    ctx.fillStyle = '#fff';
    // Goal posts (taller)
    drawPost(x, yGoalTop, goalHeight, goalThickness);
    drawPost(x, yGoalBottom, goalHeight, goalThickness);
    // Behind posts (shorter)
    drawPost(x, yBehindTop, behindHeight, behindThickness);
    drawPost(x, yBehindBottom, behindHeight, behindThickness);
  }

  public getGoalAreas() {
    const goalInset = this.goalInsetPx;
    const leftX = this.cx - this.rx + goalInset;
    const rightX = this.cx + this.rx - goalInset;
    const halfGoal = 3.2 * this.postSpreadFactor;
    const behindOffset = 6.4 * this.postSpreadFactor;
    const yGoalTop = this.cy - this.px(halfGoal);
    const yGoalBottom = this.cy + this.px(halfGoal);
    const yBehindTop = this.cy - this.px(halfGoal + behindOffset);
    const yBehindBottom = this.cy + this.px(halfGoal + behindOffset);
    return {
      left: {
        x: leftX,
        yGoalTop,
        yGoalBottom,
        yBehindTop,
        yBehindBottom,
      },
      right: {
        x: rightX,
        yGoalTop,
        yGoalBottom,
        yBehindTop,
        yBehindBottom,
      },
    };
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

  // Robust numeric trimming: find arc endpoints where the 50m circle meets the oval boundary.
  private goalArcAngles(gx: number, r: number): [number, number] {
    const insideAt = (angle: number) => {
      const x = gx + r * Math.cos(angle);
      const y = this.cy + r * Math.sin(angle);
      return this.isInside(x, y, 0);
    };

    const base = gx < this.cx ? 0 : Math.PI; // left arcs around 0, right around pi
    const findBound = (sign: 1 | -1) => {
      let lo = 0;
      let hi = Math.PI / 2;
      // If even the far end is inside, return hi
      if (insideAt(base + sign * hi)) return hi;
      // Binary search for transition from inside to outside
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        if (insideAt(base + sign * mid)) lo = mid; else hi = mid;
      }
      return lo;
    };

    const upper = findBound(-1);
    const lower = findBound(1);
    return [base - upper, base + lower];
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
