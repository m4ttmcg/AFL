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
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private readonly animationSpeed: number = 0.15; // Seconds per frame
  private readonly framesPerRow: number = 4; // 4 animation frames
  private currentDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  
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
    
    // Update movement direction based on strongest input
    if (this.movement.up && Math.abs(this.vy) >= Math.abs(this.vx)) {
      this.currentDirection = 'up';
    } else if (this.movement.down && Math.abs(this.vy) >= Math.abs(this.vx)) {
      this.currentDirection = 'down';
    } else if (this.movement.left && Math.abs(this.vx) >= Math.abs(this.vy)) {
      this.currentDirection = 'left';
    } else if (this.movement.right && Math.abs(this.vx) >= Math.abs(this.vy)) {
      this.currentDirection = 'right';
    }
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (magnitude > this.speed) {
      this.vx = (this.vx / magnitude) * this.speed;
      this.vy = (this.vy / magnitude) * this.speed;
    }
    
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Update animation if moving
    if (magnitude > 0) {
      this.updateAnimation(deltaTime);
    } else {
      this.animationFrame = 0; // Standing still
    }
  }

  public updateAI(targetX: number, targetY: number, deltaTime: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      this.vx = (dx / distance) * this.speed * 0.7; // AI slightly slower
      this.vy = (dy / distance) * this.speed * 0.7;
      
      // Update direction based on AI movement
      if (Math.abs(dy) > Math.abs(dx)) {
        this.currentDirection = dy > 0 ? 'down' : 'up';
      } else {
        this.currentDirection = dx > 0 ? 'right' : 'left';
      }
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      
      // Update animation for AI movement
      this.updateAnimation(deltaTime);
    } else {
      this.animationFrame = 0; // Standing still
    }
  }

  private updateAnimation(deltaTime: number) {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % this.framesPerRow;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Try to use directional sprite if available
    if (this.spriteManager) {
      const sprite = this.spriteManager.getSpriteForTeamColorAndDirection(this.color, this.currentDirection);
      if (sprite && sprite.complete) {
        const spriteSize = 28; // Size to render the sprite
        
        // Draw the directional sprite
        ctx.drawImage(
          sprite,
          this.x - spriteSize / 2,
          this.y - spriteSize / 2,
          spriteSize,
          spriteSize
        );
        
        // Player number overlay
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 10px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.number.toString(), this.x, this.y + 2);
        ctx.fillText(this.number.toString(), this.x, this.y + 2);
        
        // Controlled player indicator
        if (this.isControlled) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
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
