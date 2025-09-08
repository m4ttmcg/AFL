export class Controls {
  private keys: Set<string> = new Set();
  public onKeyDown?: (key: string) => void;
  public onKeyUp?: (key: string) => void;

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.keys.has(event.code)) return; // Prevent key repeat
    
    this.keys.add(event.code);
    
    if (this.onKeyDown) {
      this.onKeyDown(event.code);
    }
    
    // Prevent default for game keys
    if (this.isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.keys.delete(event.code);
    
    if (this.onKeyUp) {
      this.onKeyUp(event.code);
    }
  }

  private isGameKey(code: string): boolean {
    const gameKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyJ', 'KeyK', 'KeyL', 'Space'
    ];
    return gameKeys.includes(code);
  }

  public isKeyPressed(code: string): boolean {
    return this.keys.has(code);
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
