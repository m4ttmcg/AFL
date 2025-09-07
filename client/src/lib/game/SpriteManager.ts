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
    
    // Check for red colors
    if (colorLower.includes('#ff0000') || colorLower.includes('red') || colorLower === '#ff0000') {
      return this.getSprite('player_red');
    }
    
    // Check for blue colors
    if (colorLower.includes('#0000ff') || colorLower.includes('blue') || colorLower === '#0000ff') {
      return this.getSprite('player_blue');
    }
    
    // Check for black colors
    if (colorLower.includes('#000000') || colorLower.includes('black') || colorLower === '#000000') {
      return this.getSprite('player_black');
    }
    
    // Check for other specific team colors
    if (colorLower.includes('#800080') || colorLower.includes('purple')) {
      return this.getSprite('player_red'); // Purple teams use red sprite
    }
    
    if (colorLower.includes('#8b4513') || colorLower.includes('brown')) {
      return this.getSprite('player_black'); // Brown teams use black sprite
    }
    
    if (colorLower.includes('#ffd700') || colorLower.includes('gold') || colorLower.includes('yellow')) {
      return this.getSprite('player_red'); // Gold/yellow teams use red sprite
    }
    
    if (colorLower.includes('#ffa500') || colorLower.includes('orange')) {
      return this.getSprite('player_red'); // Orange teams use red sprite
    }
    
    if (colorLower.includes('#008000') || colorLower.includes('green')) {
      return this.getSprite('player_blue'); // Green teams use blue sprite
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