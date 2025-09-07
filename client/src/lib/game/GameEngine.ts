import { Field } from "./Field";
import { Player } from "./Player";
import { Ball } from "./Ball";
import { Controls } from "./Controls";
import { Physics } from "./Physics";
import { AI } from "./AI";
import { AudioManager } from "./AudioManager";
import { SpriteManager } from "./SpriteManager";
import { Team } from "../stores/useFooty";

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private field: Field;
  private ball: Ball;
  private players: Player[] = [];
  private controls: Controls;
  private physics: Physics;
  private ai: AI;
  private audioManager: AudioManager;
  private spriteManager: SpriteManager;
  private homeTeam: Team;
  private awayTeam: Team;
  private currentPlayer: Player | null = null;
  private gameTime: number = 0;
  private lastTime: number = 0;
  private wasBallInside: boolean = true;

  constructor(ctx: CanvasRenderingContext2D, homeTeam: Team, awayTeam: Team) {
    this.ctx = ctx;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    
    this.field = new Field(ctx.canvas.width, ctx.canvas.height);
    this.ball = new Ball(ctx.canvas.width / 2, ctx.canvas.height / 2);
    this.controls = new Controls();
    this.physics = new Physics();
    this.ai = new AI();
    this.audioManager = new AudioManager();
    this.spriteManager = new SpriteManager();
    
    this.initializePlayers();
    this.bindEvents();
  }

  private initializePlayers() {
    const fieldWidth = this.ctx.canvas.width;
    const fieldHeight = this.ctx.canvas.height;
    
    // Home team players (left side)
    for (let i = 0; i < 18; i++) {
      const x = (fieldWidth * 0.25) + (Math.random() - 0.5) * 200;
      const y = (fieldHeight / 19) * (i + 1);
      const player = new Player(
        x, y, 'home', this.homeTeam.primaryColor, this.homeTeam.textColor, i + 1, this.spriteManager
      );
      this.players.push(player);
    }
    
    // Away team players (right side)
    for (let i = 0; i < 18; i++) {
      const x = (fieldWidth * 0.75) + (Math.random() - 0.5) * 200;
      const y = (fieldHeight / 19) * (i + 1);
      const player = new Player(
        x, y, 'away', this.awayTeam.primaryColor, this.awayTeam.textColor, i + 1, this.spriteManager
      );
      this.players.push(player);
    }
    
    // Set first home player as current
    this.currentPlayer = this.players.find(p => p.team === 'home') || null;
  }

  private bindEvents() {
    this.controls.onKeyDown = (key: string) => {
      console.log('Key pressed:', key);
      this.handleInput(key, true);
    };
    
    this.controls.onKeyUp = (key: string) => {
      this.handleInput(key, false);
    };
  }

  private handleInput(key: string, isPressed: boolean) {
    if (!this.currentPlayer) return;
    
    switch (key) {
      case 'KeyW':
      case 'ArrowUp':
        this.currentPlayer.setMovement('up', isPressed);
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.currentPlayer.setMovement('down', isPressed);
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.currentPlayer.setMovement('left', isPressed);
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.currentPlayer.setMovement('right', isPressed);
        break;
      case 'KeyJ':
        if (isPressed) {
          this.handleKick();
        }
        break;
      case 'KeyK':
        if (isPressed) {
          this.handleMark();
        }
        break;
      case 'KeyL':
        if (isPressed) {
          this.handleTackle();
        }
        break;
      case 'Space':
        if (isPressed) {
          this.handleSpecial();
        }
        break;
    }
  }

  private handleKick() {
    if (!this.currentPlayer || !this.ball.isNearPlayer(this.currentPlayer)) return;
    
    console.log('Player kicking ball');
    this.audioManager.playSound('hit');
    
    // Calculate kick direction and power
    const angle = Math.random() * Math.PI * 2;
    const power = 150 + Math.random() * 100;
    
    this.ball.kick(this.currentPlayer.x, this.currentPlayer.y, angle, power);
    this.switchToNearestPlayer();
  }

  private handleMark() {
    if (!this.currentPlayer) return;
    
    if (this.ball.isInAir() && this.ball.isNearPlayer(this.currentPlayer)) {
      console.log('Player marked the ball');
      this.audioManager.playSound('success');
      this.ball.catch(this.currentPlayer.x, this.currentPlayer.y);
    }
  }

  private handleTackle() {
    if (!this.currentPlayer) return;
    
    // Find nearby opponent with ball
    const opponent = this.players.find(p => 
      p.team !== this.currentPlayer!.team && 
      this.physics.distance(p, this.currentPlayer!) < 30 &&
      this.ball.isNearPlayer(p)
    );
    
    if (opponent) {
      console.log('Tackle attempted');
      this.audioManager.playSound('hit');
      // Loose ball
      this.ball.x = opponent.x + (Math.random() - 0.5) * 40;
      this.ball.y = opponent.y + (Math.random() - 0.5) * 40;
    }
  }

  private handleSpecial() {
    console.log('Special move');
  }

  private switchToNearestPlayer() {
    if (!this.currentPlayer) return;
    
    const team = this.currentPlayer.team;
    let nearest: Player | null = null;
    let minDistance = Infinity;
    
    this.players.forEach(player => {
      if (player.team === team && player !== this.currentPlayer) {
        const distance = this.physics.distance(player, this.ball);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = player;
        }
      }
    });
    
    if (nearest) {
      this.currentPlayer.isControlled = false;
      this.currentPlayer = nearest;
      this.currentPlayer.isControlled = true;
      console.log('Switched to player', nearest.number);
    }
  }

  public start() {
    console.log('Game engine started');
    this.audioManager.initialize();
    this.lastTime = performance.now();
  }

  public update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.gameTime += deltaTime;
    
    // Update ball physics
    this.ball.update(deltaTime);
    
    // Update players
    this.players.forEach(player => {
      if (player.isControlled) {
        player.updateControlled(deltaTime);
      } else {
        // AI control
        this.ai.updatePlayer(player, this.ball, this.players, deltaTime);
      }
      
      // Keep players on oval field
      const clamped = this.field.projectInside(player.x, player.y, 20);
      player.x = clamped.x;
      player.y = clamped.y;
    });
    
    // Ball out-of-bounds detection on oval boundary
    const { x: bx, y: by } = this.ball;
    const isInsideNow = this.field.isInside(bx, by, this.ball.radius);
    if (this.wasBallInside && !isInsideNow) {
      // Ball just went out
      // Determine point on edge and small epsilon outside
      const onEdge = this.field.projectInside(bx, by, this.ball.radius);
      const { nx, ny } = this.field.normalAt(onEdge.x, onEdge.y);
      // Place slightly outside and stop the ball
      this.ball.x = onEdge.x + nx * 2;
      this.ball.y = onEdge.y + ny * 2;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.vz = 0;
      this.ball.z = 0;

      // On the full if it hasn't bounced since last kick
      if (this.ball.wasKicked && !this.ball.hasBouncedSinceKick) {
        this.audioManager.speak('outta bounds. On the full');
      }

      // Reset kick tracking after leaving play
      this.ball.wasKicked = false;
      this.ball.hasBouncedSinceKick = false;
    }
    this.wasBallInside = isInsideNow;
  }

  public render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Render field
    this.field.render(this.ctx);
    
    // Render players
    this.players.forEach(player => {
      player.render(this.ctx);
    });
    
    // Render ball
    this.ball.render(this.ctx);
    
    // Highlight current player
    if (this.currentPlayer) {
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.currentPlayer.x, this.currentPlayer.y, 25, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  public destroy() {
    this.controls.destroy();
    this.audioManager.destroy();
  }
}
