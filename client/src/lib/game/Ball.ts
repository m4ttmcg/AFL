import { Player } from "./Player";

export class Ball {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public vz: number = 0; // Vertical velocity for bouncing
  public z: number = 0; // Height above ground
  public radius: number = 8;
  private gravity: number = 300;
  private bounce: number = 0.6;
  private friction: number = 0.98;
  public wasKicked: boolean = false;
  public hasBouncedSinceKick: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(deltaTime: number) {
    // Apply gravity if ball is in air
    if (this.z > 0) {
      this.vz -= this.gravity * deltaTime;
    }
    
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.z += this.vz * deltaTime;
    
    // Ball hits ground
    if (this.z <= 0) {
      this.z = 0;
      if (this.vz < 0) {
        this.vz *= -this.bounce;
        // Stop very small bounces
        if (Math.abs(this.vz) < 20) {
          this.vz = 0;
        }
        // Register that a bounce occurred after a kick
        if (this.wasKicked) {
          this.hasBouncedSinceKick = true;
        }
      }
    }
    
    // Apply friction when on ground
    if (this.z === 0) {
      this.vx *= this.friction;
      this.vy *= this.friction;
      
      // Stop very slow movement
      if (Math.abs(this.vx) < 5) this.vx = 0;
      if (Math.abs(this.vy) < 5) this.vy = 0;
    }
  }

  public kick(fromX: number, fromY: number, angle: number, power: number) {
    this.x = fromX;
    this.y = fromY;
    this.vx = Math.cos(angle) * power;
    this.vy = Math.sin(angle) * power;
    this.vz = power * 0.5; // Kick gives it some height
    this.z = 5;
    this.wasKicked = true;
    this.hasBouncedSinceKick = false;
  }

  public catch(atX: number, atY: number) {
    this.x = atX;
    this.y = atY;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.z = 0;
    this.wasKicked = false;
    this.hasBouncedSinceKick = false;
  }

  public isInAir(): boolean {
    return this.z > 5;
  }

  public isNearPlayer(player: Player): boolean {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 25;
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Ball shadow (if in air)
    if (this.z > 0) {
      const shadowRadius = this.radius * (1 - this.z / 100);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(shadowRadius, 2), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Ball
    const renderY = this.y - this.z;
    ctx.fillStyle = '#8B4513'; // Brown leather color
    ctx.beginPath();
    ctx.arc(this.x, renderY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ball stitching lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, renderY, this.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Highlight if in air
    if (this.isInAir()) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, renderY, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
