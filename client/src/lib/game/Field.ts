export class Field {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Field background
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Field border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, this.width - 10, this.height - 10);
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 5);
    ctx.lineTo(this.width / 2, this.height - 5);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Goal squares (left)
    ctx.strokeRect(5, this.height / 2 - 80, 60, 160);
    
    // Goal squares (right)
    ctx.strokeRect(this.width - 65, this.height / 2 - 80, 60, 160);
    
    // Goal posts (left)
    this.drawGoalPosts(ctx, 5, this.height / 2);
    
    // Goal posts (right)
    this.drawGoalPosts(ctx, this.width - 5, this.height / 2);
    
    // 50m arcs
    ctx.beginPath();
    ctx.arc(5, this.height / 2, 120, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(this.width - 5, this.height / 2, 120, Math.PI / 2, 3 * Math.PI / 2);
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
}
