export class SpriteManager {
  private sprites: Map<string, CanvasImageSource> = new Map();
  private loadedCount: number = 0;
  private totalSprites: number = 0;
  private onAllLoaded?: () => void;

  constructor() {
    this.loadSprites();
  }

  private loadSprites() {
    const spriteFiles = {
      'player_red_up': '/textures/player_red_up.png',
      'player_red_down': '/textures/player_red_down.png',
      'player_red_left': '/textures/player_red_left.png',
      'player_red_right': '/textures/player_red_right.png',
      'player_blue_up': '/textures/player_blue_up.png',
      'player_blue_down': '/textures/player_blue_down.png',
      'player_blue_left': '/textures/player_blue_left.png',
      'player_blue_right': '/textures/player_blue_right.png',
      'player_black_up': '/textures/player_black_up.png',
      'player_black_down': '/textures/player_black_down.png',
      'player_black_left': '/textures/player_black_left.png',
      'player_black_right': '/textures/player_black_right.png',
    };

    this.totalSprites = Object.keys(spriteFiles).length;

    Object.entries(spriteFiles).forEach(([name, path]) => {
      const img = new Image();
      img.onload = () => {
        // Post-process to remove white background via chroma key
        const processed = this.removeWhiteBackground(img);
        this.sprites.set(name, processed);
        this.loadedCount++;
        if (this.loadedCount === this.totalSprites && this.onAllLoaded) {
          this.onAllLoaded();
        }
      };
      img.onerror = (error) => {
        console.error(`Failed to load sprite: ${name}`, error);
        this.loadedCount++;
        if (this.loadedCount === this.totalSprites && this.onAllLoaded) {
          this.onAllLoaded();
        }
      };
      img.src = path;
    });
  }

  public getSprite(name: string): CanvasImageSource | null {
    return this.sprites.get(name) || null;
  }

  public getSpriteForTeamColorAndDirection(color: string, direction: 'up' | 'down' | 'left' | 'right'): CanvasImageSource | null {
    // Map team colors to sprite variants
    const colorLower = color.toLowerCase();
    let colorType = 'red'; // default
    
    // Check for red colors
    if (colorLower.includes('#ff0000') || colorLower.includes('red') || colorLower === '#ff0000') {
      colorType = 'red';
    }
    // Check for blue colors
    else if (colorLower.includes('#0000ff') || colorLower.includes('blue') || colorLower === '#0000ff') {
      colorType = 'blue';
    }
    // Check for black colors
    else if (colorLower.includes('#000000') || colorLower.includes('black') || colorLower === '#000000') {
      colorType = 'black';
    }
    // Check for other specific team colors
    else if (colorLower.includes('#800080') || colorLower.includes('purple')) {
      colorType = 'red'; // Purple teams use red sprite
    }
    else if (colorLower.includes('#8b4513') || colorLower.includes('brown')) {
      colorType = 'black'; // Brown teams use black sprite
    }
    else if (colorLower.includes('#ffd700') || colorLower.includes('gold') || colorLower.includes('yellow')) {
      colorType = 'red'; // Gold/yellow teams use red sprite
    }
    else if (colorLower.includes('#ffa500') || colorLower.includes('orange')) {
      colorType = 'red'; // Orange teams use red sprite
    }
    else if (colorLower.includes('#008000') || colorLower.includes('green')) {
      colorType = 'blue'; // Green teams use blue sprite
    }
    
    const spriteName = `player_${colorType}_${direction}`;
    return this.getSprite(spriteName);
  }

  // Keep the old method for backwards compatibility, defaulting to 'down' direction
  public getSpriteForTeamColor(color: string): CanvasImageSource | null {
    return this.getSpriteForTeamColorAndDirection(color, 'down');
  }

  public isAllLoaded(): boolean {
    return this.loadedCount === this.totalSprites;
  }

  public onSpritesLoaded(callback: () => void) {
    if (this.isAllLoaded()) {
      callback();
    } else {
      this.onAllLoaded = callback;
    }
  }

  private removeWhiteBackground(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const threshold = 245; // treat near-white as background
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[i + 3] = 0; // transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}
