import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private redSound: HTMLAudioElement;
  private blueSound: HTMLAudioElement;
  private suoneriaDottore: HTMLAudioElement;

  constructor() {
    this.redSound = new Audio();
    this.redSound.src = 'assets/red.mp3';
    this.redSound.load();

    this.blueSound = new Audio();
    this.blueSound.src = 'assets/red.mp3';
    this.blueSound.load();

    this.suoneriaDottore = new Audio();
    this.suoneriaDottore.src = 'assets/suoneria_dottore.mp3';
    this.suoneriaDottore.load();
  }

  playRedSound(): void {
    this.redSound.play();
  }

  playBlueSound(): void {
    this.blueSound.play();
  }

  playSuoneriaDottore(): void {
    this.suoneriaDottore.play();
  }
}