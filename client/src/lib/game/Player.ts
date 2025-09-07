import { SpriteManager } from "./SpriteManager";

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public team: 'home' | 'away';
  public color: string;
  public textColor: string;
  public number: number;
  public isControlled: boolean = false;
  public speed: number = 120;
  private spriteManager?: SpriteManager;
  
  private movement = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  constructor(x: number, y: number, team: 'home' | 'away', color: string, textColor: string, number: number, spriteManager?: SpriteManager) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.color = color;
    this.textColor = textColor;
    this.number = number;
    this.spriteManager = spriteManager;
  }

  public setMovement(direction: keyof typeof this.movement, active: boolean) {
    this.movement[direction] = active;
  }

  public updateControlled(deltaTime: number) {
    this.vx = 0;
    this.vy = 0;
    
    if (this.movement.up) this.vy -= this.speed;
    if (this.movement.down) this.vy += this.speed;
    if (this.movement.left) this.vx -= this.speed;
    if (this.movement.right) this.vx += this.speed;
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (magnitude > this.speed) {
      this.vx = (this.vx / magnitude) * this.speed;
      this.vy = (this.vy / magnitude) * this.speed;
    }
    
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  public updateAI(targetX: number, targetY: number, deltaTime: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      this.vx = (dx / distance) * this.speed * 0.7; // AI slightly slower
      this.vy = (dy / distance) * this.speed * 0.7;
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Try to use sprite if available
    if (this.spriteManager) {
      const sprite = this.spriteManager.getSpriteForTeamColor(this.color);
      if (sprite && sprite.complete) {
        const spriteSize = 24; // Size to render the sprite
        ctx.drawImage(
          sprite,
          this.x - spriteSize / 2,
          this.y - spriteSize / 2,
          spriteSize,
          spriteSize
        );
        
        // Player number overlay
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 8px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(this.number.toString(), this.x, this.y + 8);
        ctx.fillText(this.number.toString(), this.x, this.y + 8);
        
        // Controlled player indicator
        if (this.isControlled) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }
        return;
      }
    }
    
    // Fallback to circle rendering if sprite not available
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Player border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Player number
    ctx.fillStyle = this.textColor;
    ctx.font = 'bold 10px Inter, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), this.x, this.y);
    
    // Controlled player indicator
    if (this.isControlled) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
