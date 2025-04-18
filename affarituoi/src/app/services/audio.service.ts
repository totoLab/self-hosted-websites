import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private boxSound: HTMLAudioElement;
  private suoneriaDottore: HTMLAudioElement;

  constructor() {
    this.boxSound = new Audio();

    this.suoneriaDottore = new Audio();
    this.suoneriaDottore.src = 'assets/suoneria_dottore.mp3';
    this.suoneriaDottore.load();
  }

  fadeVolume(callback?: () => void): void {
    const factor = 0.01;
    const speed = 50;

    const fade = () => {
      if (this.boxSound.volume > factor) {
        this.boxSound.volume -= factor;
        setTimeout(fade, speed);
      } else {
        this.boxSound.volume = 0;
        if (typeof callback === 'function') callback();
      }
    };

    fade();

  }

  resetVolume() {
    this.boxSound.volume = 1;
  }

  playBoxSound(asset: string): void {
    this.boxSound.src = asset;
    this.boxSound.load();
    this.boxSound.play();
  }
 
  playRedSound(): void {
    this.playBoxSound('assets/red.mp3');
  }

  playBlueSound(): void {
    this.playBoxSound('assets/cuoricini.mp3');
  }

  playVictorySound(): void {
    this.playBoxSound('assets/epic.mp3');
  }

  playSuoneriaDottore(): void {
    this.fadeVolume(() => {
      this.boxSound.pause();
      this.resetVolume();
    });
    
    this.suoneriaDottore.play();
  }

  reset() {
    this.boxSound.load();
    this.suoneriaDottore.load();
  }
}