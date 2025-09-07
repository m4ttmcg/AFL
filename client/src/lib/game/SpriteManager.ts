export class SpriteManager {
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalSprites: number = 0;
  private onAllLoaded?: () => void;

  constructor() {
    this.loadSprites();
  }

  private loadSprites() {
    const spriteFiles = {
      'player_red': '/textures/player_red.png',
      'player_blue': '/textures/player_blue.png',
      'player_black': '/textures/player_black.png',
    };

    this.totalSprites = Object.keys(spriteFiles).length;

    Object.entries(spriteFiles).forEach(([name, path]) => {
      const img = new Image();
      img.onload = () => {
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
      this.sprites.set(name, img);
    });
  }

  public getSprite(name: string): HTMLImageElement | null {
    return this.sprites.get(name) || null;
  }

  public getSpriteForTeamColor(color: string): HTMLImageElement | null {
    // Map team colors to sprite variants
    const colorLower = color.toLowerCase();
    
    if (colorLower.includes('#ff0000') || colorLower.includes('red')) {
      return this.getSprite('player_red');
    }
    if (colorLower.includes('#0000ff') || colorLower.includes('blue')) {
      return this.getSprite('player_blue');
    }
    if (colorLower.includes('#000000') || colorLower.includes('black')) {
      return this.getSprite('player_black');
    }
    
    // Default to red for unknown colors
    return this.getSprite('player_red');
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
}