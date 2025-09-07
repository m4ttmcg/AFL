import { Field } from "./Field";
import { Player } from "./Player";
import { Ball } from "./Ball";
import { Controls } from "./Controls";
import { Physics } from "./Physics";
import { AI } from "./AI";
import { AudioManager } from "./AudioManager";
import { SpriteManager } from "./SpriteManager";
import { Team, useFooty } from "../stores/useFooty";

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
  private audioUnlocked: boolean = false;
  private prevBallX: number = 0;

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
      if (!this.audioUnlocked) {
        // Unlock audio on first user interaction
        this.audioUnlocked = true;
        this.audioManager.playBackgroundMusic();
      }
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
    
    // Calculate kick direction from player input/facing
    const aim = this.currentPlayer.getAimVector();
    let ax = aim.dx;
    let ay = aim.dy;
    if (ax === 0 && ay === 0) {
      // Fallback: towards attacking goal
      ax = this.currentPlayer.team === 'home' ? 1 : -1;
      ay = 0;
    }
    // Add slight aim randomness (±10 degrees)
    const jitter = (Math.random() - 0.5) * (Math.PI / 9);
    const baseAngle = Math.atan2(ay, ax);
    const angle = baseAngle + jitter;
    // Power with small variation
    const power = 200 + Math.random() * 60;
    
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
    this.prevBallX = this.ball.x;
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
    
    // Scoring detection (must run before OOB to avoid false OOB)
    if (this.checkScoring()) {
      // Reset OOB state so next frame proceeds normally
      this.wasBallInside = true;
      return;
    }

    // Ball out-of-bounds detection on oval boundary
    const { x: bx, y: by } = this.ball;
    const isInsideNow = this.field.isInside(bx, by, this.ball.radius);
    if (this.wasBallInside && !isInsideNow) {
      const onEdge = this.field.projectInside(bx, by, this.ball.radius);
      const { nx, ny } = this.field.normalAt(onEdge.x, onEdge.y);

      // Check for scoring at ends before OOB handling
      const ellipse = this.field.getEllipse();
      const areas = this.field.getGoalAreas();
      const endEpsilon = 6; // px tolerance to consider at the end line
      let scored = false;

      if (Math.abs(onEdge.x - (ellipse.cx - ellipse.rx)) <= endEpsilon) {
        // Left end
        if (onEdge.y >= areas.left.yGoalTop && onEdge.y <= areas.left.yGoalBottom) {
          // Goal for away
          useFooty.getState().addScore('away', 1, 0);
          this.audioManager.playSound('success');
          this.ball.catch(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
          scored = true;
        } else if (onEdge.y >= areas.left.yBehindTop && onEdge.y <= areas.left.yBehindBottom) {
          // Behind for away
          useFooty.getState().addScore('away', 0, 1);
          const inside = this.field.projectInside(areas.left.x + 20, onEdge.y, this.ball.radius);
          this.ball.catch(inside.x, inside.y);
          scored = true;
        }
      } else if (Math.abs(onEdge.x - (ellipse.cx + ellipse.rx)) <= endEpsilon) {
        // Right end
        if (onEdge.y >= areas.right.yGoalTop && onEdge.y <= areas.right.yGoalBottom) {
          // Goal for home
          useFooty.getState().addScore('home', 1, 0);
          this.audioManager.playSound('success');
          this.ball.catch(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
          scored = true;
        } else if (onEdge.y >= areas.right.yBehindTop && onEdge.y <= areas.right.yBehindBottom) {
          // Behind for home
          useFooty.getState().addScore('home', 0, 1);
          const inside = this.field.projectInside(areas.right.x - 20, onEdge.y, this.ball.radius);
          this.ball.catch(inside.x, inside.y);
          scored = true;
        }
      }

      if (!scored) {
        // Treat as out on the full or standard OOB
        this.ball.x = onEdge.x + nx * 2;
        this.ball.y = onEdge.y + ny * 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.vz = 0;
        this.ball.z = 0;

        if (this.ball.wasKicked && !this.ball.hasBouncedSinceKick) {
          this.audioManager.playVoice('oob_full', 'outta bounds. On the full');
        }
      }

      // Reset kick tracking after leaving play (score or OOB)
      this.ball.wasKicked = false;
      this.ball.hasBouncedSinceKick = false;
    }
    this.wasBallInside = isInsideNow;
  }

  private checkScoring(): boolean {
    const areas = this.field.getGoalAreas();
    const bx = this.ball.x;
    const by = this.ball.y;
    const store = useFooty.getState();

    // Left side scoring (away team)
    if (this.prevBallX >= areas.left.x && bx < areas.left.x) {
      if (by >= areas.left.yGoalTop && by <= areas.left.yGoalBottom) {
        // Goal for away
        store.addScore('away', 1, 0);
        this.audioManager.playSound('success');
        // Restart at centre
        this.ball.catch(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        return true;
      } else if (by >= areas.left.yBehindTop && by <= areas.left.yBehindBottom) {
        // Behind for away
        store.addScore('away', 0, 1);
        // Place ball just inside field near goal line for kick-in
        const inside = this.field.projectInside(areas.left.x + 20, this.ctx.canvas.height / 2, this.ball.radius);
        this.ball.catch(inside.x, by);
        return true;
      }
    }

    // Right side scoring (home team)
    if (this.prevBallX <= areas.right.x && bx > areas.right.x) {
      if (by >= areas.right.yGoalTop && by <= areas.right.yGoalBottom) {
        // Goal for home
        store.addScore('home', 1, 0);
        this.audioManager.playSound('success');
        // Restart at centre
        this.ball.catch(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        return true;
      } else if (by >= areas.right.yBehindTop && by <= areas.right.yBehindBottom) {
        // Behind for home
        store.addScore('home', 0, 1);
        const inside = this.field.projectInside(areas.right.x - 20, this.ctx.canvas.height / 2, this.ball.radius);
        this.ball.catch(inside.x, by);
        return true;
      }
    }

    return false;
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
