export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  public initialize() {
    this.loadSounds();
  }

  private loadSounds() {
    // Load available sounds
    const soundFiles = {
      'hit': '/sounds/hit.mp3',
      'success': '/sounds/success.mp3',
      'background': '/sounds/background.mp3'
    };

    Object.entries(soundFiles).forEach(([name, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = name === 'background' ? 0.3 : 0.5;
      
      if (name === 'background') {
        audio.loop = true;
        this.backgroundMusic = audio;
      } else {
        this.sounds.set(name, audio);
      }
    });
  }

  public playSound(name: string) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      // Clone the sound to allow overlapping playback
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = sound.volume;
      soundClone.play().catch(error => {
        console.log(`Sound ${name} play prevented:`, error);
      });
    }
  }

  public playBackgroundMusic() {
    if (this.isMuted || !this.backgroundMusic) return;
    
    this.backgroundMusic.play().catch(error => {
      console.log('Background music play prevented:', error);
    });
  }

  public stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
  }

  public destroy() {
    this.stopBackgroundMusic();
    this.sounds.clear();
  }
}
